import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Services
import adManager from './src/services/ads';
import iapManager from './src/services/iap';
import analyticsManager from './src/services/analytics';
import SoundManager from './src/utils/soundUtils';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';
import WinScreen from './src/screens/WinScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import PremiumScreen from './src/screens/PremiumScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [adsRemoved, setAdsRemoved] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing Memory Master Pro...');
      
      // Initialize all services in sequence
      await analyticsManager.initialize();
      console.log('✅ Analytics initialized');
      
      await adManager.initialize();
      console.log('✅ AdMob initialized');
      
      await iapManager.initialize();
      console.log('✅ IAP initialized');
      
      await SoundManager.initialize();
      console.log('✅ Sound system initialized');
      
      // Check if user has already purchased remove ads
      const hasPurchased = await iapManager.hasPurchasedRemoveAds();
      setAdsRemoved(hasPurchased);
      adManager.setAdsRemoved(hasPurchased);
      
      // Set up IAP success callback
      iapManager.onPurchaseSuccess = (purchase) => {
        setAdsRemoved(true);
        adManager.setAdsRemoved(true);
        console.log('🎉 Purchase successful - ads removed');
      };

      console.log('✅ All services initialized successfully');
      setIsReady(true);
      
      // Track app launch
      await analyticsManager.trackAppLaunch();
      
    } catch (error) {
      console.log('❌ App initialization failed:', error);
      setError(error.message);
      await analyticsManager.trackError(error, { context: 'app_initialization' });
    }
  };

  const renderLoadingScreen = () => (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: '#2563eb' 
    }}>
      <Text style={{ 
        fontSize: 32, 
        color: 'white', 
        fontWeight: 'bold',
        marginBottom: 20 
      }}>
        Memory Master
      </Text>
      <Text style={{ 
        fontSize: 18, 
        color: 'white', 
        marginBottom: 30,
        opacity: 0.9
      }}>
        Training Your Brain...
      </Text>
      <ActivityIndicator size="large" color="white" />
    </View>
  );

  const renderErrorScreen = () => (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: '#f8fafc',
      padding: 20 
    }}>
      <Text style={{ 
        fontSize: 24, 
        color: '#ef4444', 
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center'
      }}>
        😔 Unable to Start
      </Text>
      <Text style={{ 
        fontSize: 16, 
        color: '#64748b', 
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 22
      }}>
        There was a problem starting the app.{'\n'}
        Please check your connection and try again.
      </Text>
      <Text style={{ 
        fontSize: 12, 
        color: '#94a3b8', 
        textAlign: 'center'
      }}>
        Error: {error}
      </Text>
    </View>
  );

  if (error) {
    return renderErrorScreen();
  }

  if (!isReady) {
    return renderLoadingScreen();
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2563eb',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          headerBackTitleVisible: false,
          cardStyle: {
            backgroundColor: '#f8fafc'
          }
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ 
            title: 'Memory Master',
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="Game" 
          component={GameScreen}
          options={({ route }) => ({ 
            title: `${route.params?.difficulty?.toUpperCase() || 'Memory'} Challenge`,
            headerStyle: {
              backgroundColor: '#10b981',
            }
          })}
        />
        <Stack.Screen 
          name="Win" 
          component={WinScreen}
          options={{ 
            title: 'Congratulations! 🎉',
            headerStyle: {
              backgroundColor: '#f59e0b',
            }
          }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ 
            title: 'Settings'
          }}
        />
        <Stack.Screen 
          name="Premium" 
          component={PremiumScreen}
          options={{ 
            title: 'Go Premium',
            headerStyle: {
              backgroundColor: '#8b5cf6',
            }
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}