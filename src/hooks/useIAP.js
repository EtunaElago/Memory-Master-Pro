import { useState, useEffect, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import iapManager from '../services/iap';

export const useIAP = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchased, setPurchased] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    initializeIAP();
    
    // Set up ads removed callback
    iapManager.onAdsRemovedChanged = setPurchased;
    
    return () => {
      iapManager.destroy();
    };
  }, []);

  const initializeIAP = async () => {
    try {
      setLoading(true);
      await iapManager.initialize();
      
      const hasPurchased = await iapManager.hasPurchasedRemoveAds();
      setPurchased(hasPurchased);
      
    } catch (error) {
      console.log('IAP initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const purchaseRemoveAds = async () => {
    if (purchasing) return;
    
    setPurchasing(true);
    try {
      const result = await iapManager.purchaseRemoveAds();
      
      Alert.alert(
        '🎉 Purchase Successful!',
        'All ads have been removed. Thank you for your support!',
        [{ text: 'Continue Playing', style: 'default' }]
      );
      
      return result;
      
    } catch (error) {
      console.log('Purchase error:', error);
      
      let errorMessage = 'Purchase failed. Please try again.';
      
      if (error.code === 'E_USER_CANCELLED') {
        errorMessage = 'Purchase was cancelled.';
      } else if (error.code === 'E_ITEM_UNAVAILABLE') {
        errorMessage = 'This product is not available.';
      } else if (error.code === 'E_NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      Alert.alert('Purchase Failed', errorMessage);
      throw error;
      
    } finally {
      setPurchasing(false);
    }
  };

  const restorePurchases = async () => {
    setRestoring(true);
    try {
      const success = await iapManager.restorePurchases();
      
      if (success) {
        Alert.alert('Success', 'Your purchase has been restored!');
      } else {
        Alert.alert('No Purchases', 'No previous purchases found.');
      }
      
      return success;
    } catch (error) {
      Alert.alert('Restore Failed', 'Unable to restore purchases. Please try again.');
      throw error;
    } finally {
      setRestoring(false);
    }
  };

  const getProductInfo = useCallback(() => {
    return iapManager.getRemoveAdsProduct();
  }, []);

  return {
    products,
    loading,
    purchased,
    purchasing,
    restoring,
    purchaseRemoveAds,
    restorePurchases,
    getProductInfo,
    refresh: initializeIAP
  };
};