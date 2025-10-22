import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';

class AnalyticsManager {
  constructor() {
    this.initialized = false;
    this.sessionStartTime = null;
    this.dailyRevenue = 0;
    this.dailyUsers = new Set();
  }

  async initialize() {
    try {
      await analytics().setAnalyticsCollectionEnabled(true);
      await crashlytics().setCrashlyticsCollectionEnabled(true);
      
      this.initialized = true;
      console.log('✅ Analytics & Crashlytics initialized');
      return true;
    } catch (error) {
      console.log('❌ Analytics initialization failed:', error);
      return false;
    }
  }

  // Critical Events Tracking (as per your requirements)
  async trackAppLaunch() {
    if (!this.initialized) return;
    
    try {
      this.sessionStartTime = Date.now();
      
      await analytics().logEvent('app_launch', {
        timestamp: new Date().toISOString(),
        platform: Platform.OS,
        version: '1.0.0'
      });
      
      console.log('📱 App launch tracked');
    } catch (error) {
      console.log('Error tracking app launch:', error);
    }
  }

  async trackGameStart(difficulty, mode = 'classic') {
    if (!this.initialized) return;
    
    try {
      await analytics().logEvent('game_start', {
        difficulty,
        game_mode: mode,
        timestamp: new Date().toISOString(),
      });
      
      // Set user property for preferred difficulty
      await analytics().setUserProperty('preferred_difficulty', difficulty);
      
      console.log('🎮 Game start tracked');
    } catch (error) {
      console.log('Error tracking game start:', error);
    }
  }

  async trackGameComplete(result) {
    if (!this.initialized) return;
    
    try {
      const accuracy = result.matches > 0 ? (result.matches / result.moves * 100).toFixed(2) : 0;
      
      await analytics().logEvent('game_complete', {
        moves: result.moves,
        time_seconds: result.time,
        matches: result.matches,
        difficulty: result.difficulty,
        accuracy: parseFloat(accuracy),
        score: result.score || 0,
        timestamp: new Date().toISOString(),
      });
      
      // Custom dimensions
      await this.setCustomDimensions({
        difficulty_level: result.difficulty,
        game_duration: result.time,
        moves_count: result.moves,
        accuracy_percentage: accuracy
      });
      
      console.log('🏆 Game complete tracked');
    } catch (error) {
      console.log('Error tracking game complete:', error);
    }
  }

  async trackAdWatch(adType, placement, revenue = 0) {
    if (!this.initialized) return;
    
    try {
      await analytics().logEvent('ad_watch', {
        ad_type: adType,
        placement,
        revenue: revenue,
        timestamp: new Date().toISOString(),
      });
      
      // Track revenue for ARPPAU calculation
      this.dailyRevenue += revenue;
      
      console.log('📺 Ad watch tracked:', adType);
    } catch (error) {
      console.log('Error tracking ad watch:', error);
    }
  }

  async trackPurchaseAttempt(productId, success, revenue = 0) {
    if (!this.initialized) return;
    
    try {
      await analytics().logEvent('purchase_attempt', {
        product_id: productId,
        success,
        revenue: revenue,
        timestamp: new Date().toISOString(),
      });
      
      if (success && revenue > 0) {
        this.dailyRevenue += revenue;
        await this.trackRevenue(revenue, 'iap');
      }
      
      console.log('💰 Purchase attempt tracked:', productId, success);
    } catch (error) {
      console.log('Error tracking purchase attempt:', error);
    }
  }

  // ARPPAU Calculation & Revenue Tracking
  async trackRevenue(amount, source) {
    if (!this.initialized) return;
    
    try {
      await analytics().logEvent('revenue_track', {
        amount,
        source,
        currency: 'USD',
        timestamp: new Date().toISOString(),
      });
      
      console.log('💵 Revenue tracked:', amount, source);
    } catch (error) {
      console.log('Error tracking revenue:', error);
    }
  }

  // Custom Dimensions Setup
  async setCustomDimensions(dimensions) {
    if (!this.initialized) return;
    
    try {
      for (const [key, value] of Object.entries(dimensions)) {
        await analytics().setUserProperty(key, String(value));
      }
    } catch (error) {
      console.log('Error setting custom dimensions:', error);
    }
  }

  // Session Tracking
  async trackSessionStart() {
    if (!this.initialized) return;
    
    try {
      this.sessionStartTime = Date.now();
      await analytics().logEvent('session_start', {
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.log('Error tracking session start:', error);
    }
  }

  async trackSessionEnd() {
    if (!this.initialized || !this.sessionStartTime) return;
    
    try {
      const duration = Math.floor((Date.now() - this.sessionStartTime) / 1000);
      await analytics().logEvent('session_end', {
        duration_seconds: duration,
        timestamp: new Date().toISOString(),
      });
      
      this.sessionStartTime = null;
    } catch (error) {
      console.log('Error tracking session end:', error);
    }
  }

  // Crashlytics Integration
  async logError(error, context = {}) {
    try {
      await crashlytics().recordError(error, JSON.stringify(context));
      console.log('🚨 Error logged to Crashlytics:', error.message);
    } catch (crashError) {
      console.log('Error logging to Crashlytics:', crashError);
    }
  }

  async setUserIdentifier(userId) {
    try {
      await crashlytics().setUserId(userId);
    } catch (error) {
      console.log('Error setting user ID in Crashlytics:', error);
    }
  }

  // ARPPAU Calculation Helper
  calculateARPPAU(dailyActiveUsers, dailyRevenue) {
    if (dailyActiveUsers === 0) return 0;
    return dailyRevenue / dailyActiveUsers;
  }

  // Daily Reset (call this once per day)
  async dailyReset() {
    this.dailyRevenue = 0;
    this.dailyUsers.clear();
    
    // Log daily summary
    if (this.initialized) {
      await analytics().logEvent('daily_summary', {
        date: new Date().toISOString().split('T')[0],
        revenue: this.dailyRevenue,
        unique_users: this.dailyUsers.size,
      });
    }
  }
}

// Create singleton instance
const analyticsManager = new AnalyticsManager();
export default analyticsManager;