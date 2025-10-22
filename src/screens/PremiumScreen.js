import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking
} from 'react-native';
import { useIAP } from '../hooks/useIAP';
import adManager from '../services/ads';
import analytics from '@react-native-firebase/analytics';
import colors from '../styles/colors';
import typography from '../styles/typography';
import spacing from '../styles/spacing';

const PremiumScreen = ({ navigation }) => {
  const {
    purchased,
    purchasing,
    restoring,
    purchaseRemoveAds,
    restorePurchases,
    getProductInfo
  } = useIAP();

  const [product, setProduct] = useState(null);

  useEffect(() => {
    const productInfo = getProductInfo();
    setProduct(productInfo);
  }, [getProductInfo]);

  const handlePurchase = async () => {
    try {
      await purchaseRemoveAds();
      // Ads will be automatically removed via the callback
    } catch (error) {
      // Error handled in the hook
    }
  };

  const handleRestore = async () => {
    try {
      await restorePurchases();
    } catch (error) {
      // Error handled in the hook
    }
  };

  const handleContactSupport = () => {
    const subject = encodeURIComponent('Memory Master - IAP Support');
    const body = encodeURIComponent(`Hello Memory Master team,\n\nI need help with my in-app purchase.\n\nPurchase details:\n- Product: Remove Ads\n- Issue: \n\nThank you!`);
    
    Linking.openURL(`mailto:support@memorymaster.com?subject=${subject}&body=${body}`)
      .catch(() => {
        Alert.alert('Error', 'Could not open email app. Please contact support@memorymaster.com');
      });
  };

  if (purchased) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.purchasedContainer}>
          <Text style={styles.purchasedIcon}>🎉</Text>
          <Text style={styles.purchasedTitle}>Premium Activated!</Text>
          <Text style={styles.purchasedText}>
            Thank you for purchasing Remove Ads. You now enjoy an ad-free gaming experience!
          </Text>
          
          <View style={styles.benefitsList}>
            <Text style={styles.benefitsTitle}>You Now Have:</Text>
            <Text style={styles.benefit}>✓ No banner ads</Text>
            <Text style={styles.benefit}>✓ No interstitial ads</Text>
            <Text style={styles.benefit}>✓ No video ads</Text>
            <Text style={styles.benefit}>✓ Clean, focused gameplay</Text>
          </View>

          <TouchableOpacity 
            style={styles.continueButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.continueButtonText}>Continue Playing</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (!product) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading product information...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Go Premium</Text>
        <Text style={styles.subtitle}>Ad-Free Gaming Experience</Text>
      </View>

      <View style={styles.productCard}>
        <View style={styles.productBadge}>
          <Text style={styles.productBadgeText}>POPULAR</Text>
        </View>
        
        <View style={styles.productHeader}>
          <Text style={styles.productTitle}>{product.title}</Text>
          <Text style={styles.productPrice}>{product.price}</Text>
        </View>
        
        <Text style={styles.productDescription}>{product.description}</Text>
        
        <View style={styles.featuresList}>
          {product.features && product.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.purchaseButton,
            (purchasing || restoring) && styles.purchaseButtonDisabled
          ]}
          onPress={handlePurchase}
          disabled={purchasing || restoring}
        >
          {purchasing ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.purchaseButtonText}>
              Purchase - {product.price}
            </Text>
          )}
        </TouchableOpacity>
        
        <Text style={styles.note}>
          One-time purchase • No subscription • Lifetime access
        </Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Why Go Premium?</Text>
        <Text style={styles.infoText}>
          • Focus on your memory training without interruptions{'\n'}
          • Faster loading times without ad delays{'\n'}
          • Better battery life{'\n'}
          • Support continued development{'\n'}
          • Clean, professional experience
        </Text>
      </View>

      <View style={styles.supportSection}>
        <TouchableOpacity 
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={restoring}
        >
          {restoring ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.restoreButtonText}>Restore Purchase</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleContactSupport}>
          <Text style={styles.supportLink}>Need help with purchase?</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.legalSection}>
        <Text style={styles.legalText}>
          Payment will be charged to your {Platform.OS === 'ios' ? 'Apple ID' : 'Google Play'} account at confirmation of purchase. 
          Subscription automatically renews unless canceled at least 24 hours before the end of the current period. 
          Account will be charged for renewal within 24 hours prior to the end of the current period.
        </Text>
        
        <TouchableOpacity>
          <Text style={styles.legalLink}>Privacy Policy</Text>
        </TouchableOpacity>
        
        <TouchableOpacity>
          <Text style={styles.legalLink}>Terms of Service</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body,
    color: colors.gray,
    marginTop: spacing.md,
  },
  header: {
    backgroundColor: colors.primary,
    padding: spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.white,
    fontSize: 28,
  },
  subtitle: {
    ...typography.body,
    color: colors.white,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  productCard: {
    backgroundColor: colors.white,
    margin: spacing.xl,
    padding: spacing.xl,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    position: 'relative',
  },
  productBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  productBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  productTitle: {
    ...typography.h2,
    color: colors.primary,
    flex: 1,
  },
  productPrice: {
    ...typography.h1,
    color: colors.accent,
    fontSize: 24,
  },
  productDescription: {
    ...typography.body,
    color: colors.gray,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  featuresList: {
    marginBottom: spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureIcon: {
    color: colors.success,
    marginRight: spacing.sm,
    fontWeight: 'bold',
  },
  featureText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  purchaseButton: {
    backgroundColor: colors.accent,
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  purchaseButtonDisabled: {
    opacity: 0.6,
  },
  purchaseButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  note: {
    ...typography.caption,
    color: colors.gray,
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: colors.white,
    margin: spacing.xl,
    marginTop: 0,
    padding: spacing.lg,
    borderRadius: 12,
  },
  infoTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
    color: colors.primary,
  },
  infoText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
  },
  supportSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  restoreButton: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  restoreButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  supportLink: {
    ...typography.caption,
    color: colors.gray,
    textDecorationLine: 'underline',
  },
  legalSection: {
    padding: spacing.xl,
    paddingTop: 0,
  },
  legalText: {
    ...typography.caption,
    color: colors.gray,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  legalLink: {
    ...typography.caption,
    color: colors.primary,
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginBottom: spacing.xs,
  },
  purchasedContainer: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purchasedIcon: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  purchasedTitle: {
    ...typography.h1,
    color: colors.success,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  purchasedText: {
    ...typography.body,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  benefitsList: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.xl,
    width: '100%',
  },
  benefitsTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
    color: colors.primary,
    textAlign: 'center',
  },
  benefit: {
    ...typography.body,
    color: colors.success,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    minWidth: 200,
  },
  continueButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 18,
    textAlign: 'center',
  },
});

export default PremiumScreen;