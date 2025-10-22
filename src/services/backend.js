import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';

const db = getFirestore();
const auth = getAuth();
const functions = getFunctions();

export class BackendService {
  
  // Save game session
  static async saveGameSession(gameData) {
    const user = auth.currentUser;
    if (!user) return null;
    
    const sessionId = Date.now().toString();
    const sessionData = {
      ...gameData,
      sessionId,
      userId: user.uid,
      timestamp: new Date(),
      device: Platform.OS
    };
    
    await setDoc(doc(db, 'games', sessionId), sessionData);
    await this.updateUserStats(gameData);
    await this.updateLeaderboard(gameData);
    
    return sessionId;
  }
  
  // Update user statistics
  static async updateUserStats(gameData) {
    const user = auth.currentUser;
    if (!user) return;
    
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    const currentStats = userSnap.exists() ? userSnap.data() : {
      totalGames: 0,
      totalPlayTime: 0,
      totalMatches: 0,
      bestScore: 0,
      averageAccuracy: 0
    };
    
    const newStats = {
      totalGames: currentStats.totalGames + 1,
      totalPlayTime: currentStats.totalPlayTime + gameData.duration,
      totalMatches: currentStats.totalMatches + gameData.matches,
      bestScore: Math.max(currentStats.bestScore, gameData.score),
      lastPlayed: new Date()
    };
    
    await setDoc(userRef, newStats, { merge: true });
  }
  
  // Update leaderboard
  static async updateLeaderboard(gameData) {
    const user = auth.currentUser;
    if (!user) return;
    
    const leaderboardRef = doc(db, 'leaderboards', gameData.difficulty, 'scores', user.uid);
    const currentScore = await getDoc(leaderboardRef);
    
    if (!currentScore.exists() || gameData.score > currentScore.data().score) {
      await setDoc(leaderboardRef, {
        userId: user.uid,
        username: user.displayName || 'Player',
        score: gameData.score,
        difficulty: gameData.difficulty,
        timestamp: new Date()
      });
    }
  }
  
  // Get leaderboard
  static async getLeaderboard(difficulty = 'medium', limitCount = 10) {
    const q = query(
      collection(db, 'leaderboards', difficulty, 'scores'),
      orderBy('score', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }
  
  // Validate IAP purchase
  static async validatePurchase(receipt, platform) {
    const validatePurchase = httpsCallable(functions, 'validatePurchase');
    const result = await validatePurchase({ receipt, platform });
    return result.data;
  }
  
  // Get user progress
  static async getUserProgress() {
    const user = auth.currentUser;
    if (!user) return null;
    
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() : null;
  }
}