import { Platform, Alert } from 'react-native';
import { 
  requestPurchase, 
  finishTransaction, 
  getProducts, 
  initConnection, 
  flushFailedPurchases,
  purchaseUpdatedListener,
  purchaseErrorListener,
  getAvailablePurchases
} from 'react-native-iap';
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import AsyncStorage from '@react-native-async-storage/async-storage';

class IAPManager {
  constructor() {
    this.initialized = false;
    this.products = [];
    this.purchaseUpdateSubscription = null;
    this.purchaseErrorSubscription = null;
    
    // REAL PRODUCT IDs - YOU MUST CREATE THESE IN APP STORE CONNECT & GOOGLE PLAY
    this.productIds = Platform.OS === 'ios' 
      ? ['com.memorymaster.removeads']  // iOS Product ID
      : ['com.memorymaster.removeads']; // Android Product ID

    this.storageKeys = {
      PURCHASES: '@memory_master_purchases',
      ADS_REMOVED: '@memory_master_ads_removed',
      RECEIPTS: '@memory_master_receipts'
    };
  }

  async initialize() {
    try {
      console.log('🔄 Initializing REAL IAP...');
      
      // Initialize connection to app stores
      await initConnection();
      
      // Clear any failed purchases
      await flushFailedPurchases();
      
      // Get real products from Apple/Google
      this.products = await getProducts({ skus: this.productIds });
      console.log('✅ REAL IAP Products loaded:', this.products);
      
      // Set up real purchase listeners
      this.setupRealListeners();
      
      // Check for existing purchases
      await this.checkExistingPurchases();
      
      this.initialized = true;
      console.log('🎯 REAL IAP initialized successfully');
      return true;
      
    } catch (error) {
      console.log('❌ REAL IAP initialization failed:', error);
      crashlytics().recordError(error);
      return false;
    }
  }

  setupRealListeners() {
    // Remove existing listeners
    this.removeListeners();

    // Listen for REAL purchase updates (Apple/Google)
    this.purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase) => {
      console.log('🛒 REAL Purchase update:', purchase);
      
      try {
        const receipt = purchase.transactionReceipt || purchase.originalJson;
        console.log('📄 Purchase receipt:', receipt);
        
        // Validate the purchase
        const isValid = await this.validatePurchaseWithStores(purchase);
        
        if (isValid) {
          console.log('✅ REAL Purchase validated successfully');
          await this.completePurchase(purchase);
          await this.grantPremiumBenefits(purchase);
        } else {
          console.log('❌ REAL Purchase validation failed');
          await this.failPurchase(purchase);
        }
      } catch (error) {
        console.log('❌ Error processing purchase:', error);
        crashlytics().recordError(error);
      }
    });

    // Listen for REAL purchase errors
    this.purchaseErrorSubscription = purchaseErrorListener((error) => {
      console.log('❌ REAL Purchase error:', error);
      crashlytics().recordError(error);
    });
  }

  async validatePurchaseWithStores(purchase) {
    try {
      // BASIC VALIDATION CHECKS
      if (!purchase) {
        console.log('❌ No purchase data');
        return false;
      }

      if (!purchase.transactionId && !purchase.purchaseToken) {
        console.log('❌ No transaction ID or purchase token');
        return false;
      }

      if (purchase.productId !== this.productIds[0]) {
        console.log('❌ Wrong product ID:', purchase.productId);
        return false;
      }

      // Check if already processed
      const existing = await this.getStoredPurchase();
      if (existing && existing.transactionId === purchase.transactionId) {
        console.log('⚠️ Purchase already processed');
        return false;
      }

      // For production, you would send receipt to your backend for validation
      // For now, we'll accept valid-looking purchases
      console.log('✅ Purchase looks valid, completing transaction');
      return true;

    } catch (error) {
      console.log('❌ Purchase validation error:', error);
      return false;
    }
  }

  async purchaseRemoveAds() {
    if (!this.initialized) {
      throw new Error('IAP not initialized. Please wait...');
    }

    if (this.products.length === 0) {
      throw new Error('Products not loaded. Please try again.');
    }

    try {
      console.log('🛒 Starting REAL Remove Ads purchase...');
      
      // Track purchase attempt
      await analytics().logEvent('iap_purchase_attempt', {
        product_id: this.productIds[0],
        platform: Platform.OS,
        timestamp: new Date().toISOString()
      });

      // Request REAL purchase from Apple/Google
      await requestPurchase({ 
        sku: this.productIds[0],
        andDangerouslyFinishTransactionAutomatically: false // We handle manually
      });

      console.log('✅ REAL Purchase flow started with store');
      
      // The purchase will be handled by the listener
      return { started: true };
      
    } catch (error) {
      console.log('❌ REAL Purchase failed to start:', error);
      
      let userMessage = 'Failed to start purchase. Please try again.';
      
      if (error.code === 'E_UNAVAILABLE') {
        userMessage = 'In-app purchases are not available on this device.';
      } else if (error.code === 'E_UNKNOWN') {
        userMessage = 'An unknown error occurred. Please check your connection.';
      }
      
      await analytics().logEvent('iap_purchase_failed', {
        product_id: this.productIds[0],
        error: error.code || error.message,
        platform: Platform.OS
      });
      
      crashlytics().recordError(error);
      throw new Error(userMessage);
    }
  }

  async completePurchase(purchase) {
    try {
      console.log('✅ Completing REAL purchase transaction');
      
      // Finish the transaction with the store
      await finishTransaction({ purchase, isConsumable: false });
      
      console.log('🎉 REAL Purchase transaction completed');
      return true;
      
    } catch (error) {
      console.log('❌ Error completing purchase:', error);
      crashlytics().recordError(error);
      return false;
    }
  }

  async grantPremiumBenefits(purchase) {
    try {
      console.log('🎁 Granting REAL premium benefits');
      
      // Store purchase record
      await this.storePurchaseRecord({
        productId: purchase.productId,
        transactionId: purchase.transactionId,
        purchaseToken: purchase.purchaseToken,
        purchaseTime: purchase.transactionDate || new Date().toISOString(),
        platform: Platform.OS,
        receipt: purchase.transactionReceipt || purchase.originalJson
      });

      // Mark ads as removed
      await AsyncStorage.setItem(this.storageKeys.ADS_REMOVED, 'true');
      
      // Notify app
      this.onPurchaseSuccess(purchase);
      
      // Track success
      await analytics().logEvent('iap_purchase_success', {
        product_id: purchase.productId,
        transaction_id: purchase.transactionId,
        platform: Platform.OS,
        timestamp: new Date().toISOString()
      });

      console.log('🎉 REAL Premium benefits granted successfully');
      
    } catch (error) {
      console.log('❌ Error granting premium benefits:', error);
      crashlytics().recordError(error);
      throw error;
    }
  }

  async failPurchase(purchase) {
    try {
      console.log('❌ Failing purchase');
      await finishTransaction({ purchase, isConsumable: false });
    } catch (error) {
      console.log('Error failing purchase:', error);
    }
  }

  async storePurchaseRecord(purchase) {
    try {
      const existing = await this.getStoredPurchases();
      existing.push(purchase);
      
      await AsyncStorage.setItem(
        this.storageKeys.PURCHASES, 
        JSON.stringify(existing)
      );
      
      // Also store receipt separately
      if (purchase.receipt) {
        await AsyncStorage.setItem(
          this.storageKeys.RECEIPTS + '_' + purchase.transactionId,
          purchase.receipt
        );
      }
    } catch (error) {
      console.log('Error storing purchase record:', error);
    }
  }

  async getStoredPurchases() {
    try {
      const purchases = await AsyncStorage.getItem(this.storageKeys.PURCHASES);
      return purchases ? JSON.parse(purchases) : [];
    } catch (error) {
      return [];
    }
  }

  async getStoredPurchase() {
    const purchases = await this.getStoredPurchases();
    return purchases.find(p => p.productId === this.productIds[0]);
  }

  async hasPurchasedRemoveAds() {
    try {
      const adsRemoved = await AsyncStorage.getItem(this.storageKeys.ADS_REMOVED);
      const hasPurchase = adsRemoved === 'true';
      console.log('🔍 Has purchased remove ads:', hasPurchase);
      return hasPurchase;
    } catch (error) {
      return false;
    }
  }

  async restorePurchases() {
    try {
      console.log('🔍 Restoring REAL purchases from store...');
      
      // Get available purchases from Apple/Google
      const availablePurchases = await getAvailablePurchases();
      console.log('📦 Available purchases from store:', availablePurchases);
      
      let restored = false;
      
      for (const purchase of availablePurchases) {
        if (purchase.productId === this.productIds[0]) {
          console.log('✅ Found existing Remove Ads purchase');
          const isValid = await this.validatePurchaseWithStores(purchase);
          
          if (isValid) {
            await this.grantPremiumBenefits(purchase);
            restored = true;
          }
        }
      }
      
      if (restored) {
        console.log('🎉 REAL Purchases restored successfully');
        await analytics().logEvent('iap_restore_success', {
          timestamp: new Date().toISOString()
        });
      } else {
        console.log('ℹ️ No purchases to restore');
        await analytics().logEvent('iap_restore_none', {
          timestamp: new Date().toISOString()
        });
      }
      
      return restored;
      
    } catch (error) {
      console.log('❌ Error restoring purchases:', error);
      await analytics().logEvent('iap_restore_failed', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      crashlytics().recordError(error);
      return false;
    }
  }

  getRemoveAdsProduct() {
    const product = this.products.find(p => p.productId === this.productIds[0]);
    
    if (product) {
      return {
        id: product.productId,
        title: product.title,
        description: product.description,
        price: product.price,
        currency: product.currency,
        localizedPrice: product.localizedPrice,
        originalData: product
      };
    }
    
    // Fallback if product not loaded
    return {
      id: this.productIds[0],
      title: 'Remove Ads',
      description: 'Remove all advertisements permanently',
      price: '$2.99',
      currency: 'USD',
      features: [
        'No banner ads at the bottom of screens',
        'No interstitial ads between games', 
        'No rewarded video ads',
        'One-time purchase only',
        'Lifetime access across all devices'
      ]
    };
  }

  // Callback for purchase success
  onPurchaseSuccess = (purchase) => {
    // Override this in your component
    console.log('Purchase success callback - override me');
  };

  // Cleanup
  removeListeners() {
    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove();
      this.purchaseUpdateSubscription = null;
    }
    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove();
      this.purchaseErrorSubscription = null;
    }
  }

  destroy() {
    this.removeListeners();
    this.initialized = false;
  }
}

// Create singleton instance
const iapManager = new IAPManager();
export default iapManager;