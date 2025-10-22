import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageManager {
  constructor() {
    this.keys = {
      SETTINGS: '@memory_master_settings',
      HIGHSCORES: '@memory_master_highscores',
      STATS: '@memory_master_stats',
      PROGRESS: '@memory_master_progress',
      ACHIEVEMENTS: '@memory_master_achievements'
    };
  }

  // Settings
  async saveSettings(settings) {
    try {
      await AsyncStorage.setItem(this.keys.SETTINGS, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.log('Error saving settings:', error);
      return false;
    }
  }

  async loadSettings() {
    try {
      const settings = await AsyncStorage.getItem(this.keys.SETTINGS);
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.log('Error loading settings:', error);
      return null;
    }
  }

  // Game Statistics
  async saveGameStats(stats) {
    try {
      const existingStats = await this.loadGameStats();
      const updatedStats = {
        ...existingStats,
        ...stats,
        totalGames: (existingStats?.totalGames || 0) + 1,
        lastPlayed: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(this.keys.STATS, JSON.stringify(updatedStats));
      return true;
    } catch (error) {
      console.log('Error saving stats:', error);
      return false;
    }
  }

  async loadGameStats() {
    try {
      const stats = await AsyncStorage.getItem(this.keys.STATS);
      return stats ? JSON.parse(stats) : {
        totalGames: 0,
        totalMatches: 0,
        totalTime: 0,
        bestScore: 0,
        bestTime: 0,
        averageAccuracy: 0,
        lastPlayed: null
      };
    } catch (error) {
      console.log('Error loading stats:', error);
      return null;
    }
  }

  // High Scores
  async saveHighScore(score, difficulty, mode = 'classic') {
    try {
      const key = `${this.keys.HIGHSCORES}_${difficulty}_${mode}`;
      const existingScores = await this.loadHighScores(difficulty, mode);
      
      const newScore = {
        score,
        date: new Date().toISOString(),
        moves: score.moves,
        time: score.time,
        accuracy: score.accuracy
      };
      
      const updatedScores = [...existingScores, newScore]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10); // Keep top 10
      
      await AsyncStorage.setItem(key, JSON.stringify(updatedScores));
      return true;
    } catch (error) {
      console.log('Error saving high score:', error);
      return false;
    }
  }

  async loadHighScores(difficulty, mode = 'classic') {
    try {
      const key = `${this.keys.HIGHSCORES}_${difficulty}_${mode}`;
      const scores = await AsyncStorage.getItem(key);
      return scores ? JSON.parse(scores) : [];
    } catch (error) {
      console.log('Error loading high scores:', error);
      return [];
    }
  }

  // Player Progress
  async savePlayerProgress(progress) {
    try {
      const existingProgress = await this.loadPlayerProgress();
      const updatedProgress = {
        ...existingProgress,
        ...progress,
        level: Math.max(existingProgress?.level || 1, progress.level || 1),
        xp: (existingProgress?.xp || 0) + (progress.xp || 0),
        totalPlayTime: (existingProgress?.totalPlayTime || 0) + (progress.playTime || 0)
      };
      
      await AsyncStorage.setItem(this.keys.PROGRESS, JSON.stringify(updatedProgress));
      return true;
    } catch (error) {
      console.log('Error saving progress:', error);
      return false;
    }
  }

  async loadPlayerProgress() {
    try {
      const progress = await AsyncStorage.getItem(this.keys.PROGRESS);
      return progress ? JSON.parse(progress) : {
        level: 1,
        xp: 0,
        totalPlayTime: 0,
        themesUnlocked: ['default'],
        achievements: [],
        dailyStreak: 0,
        lastPlayDate: null
      };
    } catch (error) {
      console.log('Error loading progress:', error);
      return null;
    }
  }

  // Clear all data
  async clearAllData() {
    try {
      await AsyncStorage.multiRemove(Object.values(this.keys));
      return true;
    } catch (error) {
      console.log('Error clearing data:', error);
      return false;
    }
  }

  // Export data (for backup)
  async exportData() {
    try {
      const allData = {};
      for (const key of Object.values(this.keys)) {
        const value = await AsyncStorage.getItem(key);
        allData[key] = value ? JSON.parse(value) : null;
      }
      return allData;
    } catch (error) {
      console.log('Error exporting data:', error);
      return null;
    }
  }
}

// Create singleton instance
const storageManager = new StorageManager();
export default storageManager;