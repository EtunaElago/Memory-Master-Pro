import { MobileAds, InterstitialAd, RewardedAd, BannerAd, TestIds, AdEventType, BannerAdSize } from 'react-native-google-mobile-ads';

class AdManager {
  constructor() {
    this.initialized = false;
    this.interstitial = null;
    this.rewarded = null;
    this.gameCount = 0;
    this.adsRemoved = false;
    
    // REAL AD UNITS - REPLACE WITH YOUR ACTUAL ADMOB IDs
    this.adUnits = {
      // TEST IDs (use these for development)
      interstitial: __DEV__ ? 'ca-app-pub-3940256099942544/1033173712' : 'ca-app-pub-3940256099942544/1033173712',
      rewarded: __DEV__ ? 'ca-app-pub-3940256099942544/5224354917' : 'ca-app-pub-3940256099942544/5224354917',
      banner: __DEV__ ? 'ca-app-pub-3940256099942544/6300978111' : 'ca-app-pub-3940256099942544/6300978111'
      
      // PRODUCTION IDs (replace with your actual IDs when ready)
      // interstitial: 'ca-app-pub-1234567890123456/1234567890',
      // rewarded: 'ca-app-pub-1234567890123456/0987654321', 
      // banner: 'ca-app-pub-1234567890123456/1122334455'
    };

    this.bannerAdComponent = null;
  }

  async initialize() {
    try {
      await MobileAds().initialize();
      this.initialized = true;
      
      // Load initial ads
      this.loadInterstitial();
      this.loadRewarded();
      
      console.log('✅ AdMob initialized with real ad units');
      return true;
    } catch (error) {
      console.log('❌ AdMob initialization failed:', error);
      return false;
    }
  }

  // Set ads removed status
  setAdsRemoved(removed) {
    this.adsRemoved = removed;
    if (removed) {
      console.log('🎉 Ads removed - ad-free experience activated');
    }
  }

  // Real Banner Ad Component
  BannerAdComponent = ({ style }) => {
    const [adLoaded, setAdLoaded] = useState(false);

    if (this.adsRemoved) {
      return null;
    }

    return (
      <BannerAd
        unitId={this.adUnits.banner}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
          keywords: ['games', 'puzzle', 'memory', 'brain', 'training'],
        }}
        onAdLoaded={() => {
          console.log('✅ Real banner ad loaded and showing');
          setAdLoaded(true);
        }}
        onAdFailedToLoad={(error) => {
          console.log('❌ Real banner ad failed:', error);
          setAdLoaded(false);
        }}
        onAdOpened={() => {
          console.log('📱 User clicked banner ad');
          // Track ad click
        }}
        style={[style, { display: adLoaded ? 'flex' : 'none' }]}
      />
    );
  };

  // Real Interstitial Ads - Show every 3 games
  loadInterstitial() {
    if (this.adsRemoved) return;

    this.interstitial = InterstitialAd.createForAdRequest(this.adUnits.interstitial, {
      requestNonPersonalizedAdsOnly: true,
      keywords: ['memory-game', 'puzzle', 'brain-training', 'cognitive'],
    });

    this.interstitial.addAdEventListener(AdEventType.LOADED, () => {
      console.log('✅ Real interstitial ad loaded and ready');
    });

    this.interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
      console.log('❌ Real interstitial failed:', error);
      // Retry loading after 30 seconds
      setTimeout(() => this.loadInterstitial(), 30000);
    });

    this.interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('📱 Interstitial ad closed');
      this.loadInterstitial(); // Preload next ad
    });

    this.interstitial.load();
  }

  async showInterstitial() {
    if (this.adsRemoved || !this.initialized || !this.interstitial) {
      console.log('🚫 Ads disabled or not ready');
      return false;
    }

    try {
      this.gameCount++;
      
      // Show ad every 3 games
      if (this.gameCount % 3 === 0) {
        const isLoaded = await this.interstitial.loaded;
        if (isLoaded) {
          console.log('🎯 Showing real interstitial ad (game #' + this.gameCount + ')');
          await this.interstitial.show();
          return true;
        } else {
          console.log('⏳ Interstitial not loaded yet');
          this.loadInterstitial();
        }
      }
      return false;
    } catch (error) {
      console.log('❌ Error showing interstitial:', error);
      return false;
    }
  }

  // Real Rewarded Ads for Extra Moves
  loadRewarded() {
    if (this.adsRemoved) return;

    this.rewarded = RewardedAd.createForAdRequest(this.adUnits.rewarded, {
      requestNonPersonalizedAdsOnly: true,
      keywords: ['game-reward', 'extra-moves', 'power-up'],
    });

    this.rewarded.addAdEventListener(AdEventType.LOADED, () => {
      console.log('✅ Real rewarded ad loaded and ready');
    });

    this.rewarded.addAdEventListener(AdEventType.ERROR, (error) => {
      console.log('❌ Real rewarded failed:', error);
      setTimeout(() => this.loadRewarded(), 30000);
    });

    this.rewarded.load();
  }

  async showRewarded() {
    return new Promise((resolve) => {
      if (this.adsRemoved || !this.initialized || !this.rewarded) {
        resolve(false);
        return;
      }

      let earnedReward = false;

      const unsubscribeLoaded = this.rewarded.addAdEventListener(AdEventType.LOADED, () => {
        unsubscribeLoaded();
        console.log('🎯 Showing real rewarded ad for reward');
        this.rewarded.show()
          .then(() => {
            console.log('✅ Rewarded ad shown successfully');
          })
          .catch(error => {
            console.log('❌ Rewarded ad failed to show:', error);
            resolve(false);
          });
      });

      const unsubscribeEarned = this.rewarded.addAdEventListener(AdEventType.EARNED, (reward) => {
        unsubscribeEarned();
        console.log('🎁 User earned real reward:', reward);
        earnedReward = true;
        this.loadRewarded(); // Preload next ad
        resolve(true);
      });

      const unsubscribeClosed = this.rewarded.addAdEventListener(AdEventType.CLOSED, () => {
        unsubscribeClosed();
        console.log('📱 Rewarded ad closed');
        if (!earnedReward) {
          console.log('🚫 User did not earn reward');
          resolve(false);
        }
      });

      const unsubscribeError = this.rewarded.addAdEventListener(AdEventType.ERROR, (error) => {
        unsubscribeError();
        console.log('❌ Rewarded ad error:', error);
        resolve(false);
      });

      // Load if not already loaded
      if (!this.rewarded.loaded) {
        this.rewarded.load();
      }
    });
  }

  // Force show ad (for testing)
  async forceShowInterstitial() {
    if (this.adsRemoved) {
      console.log('🚫 Ads are removed - cannot show');
      return false;
    }
    
    const isLoaded = await this.interstitial.loaded;
    if (isLoaded) {
      await this.interstitial.show();
      return true;
    } else {
      console.log('⏳ No ad loaded to show');
      this.loadInterstitial();
      return false;
    }
  }

  // Get ad status for debugging
  getAdStatus() {
    return {
      initialized: this.initialized,
      adsRemoved: this.adsRemoved,
      gameCount: this.gameCount,
      interstitialLoaded: this.interstitial ? this.interstitial.loaded : false,
      rewardedLoaded: this.rewarded ? this.rewarded.loaded : false,
      nextInterstitialAt: (3 - (this.gameCount % 3)) % 3 || 3
    };
  }
}

// Create and export singleton instance
const adManager = new AdManager();
export default adManager;