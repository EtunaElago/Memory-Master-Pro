import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

// Screens
import HomeScreen from '../screens/HomeScreen';
import GameScreen from '../screens/GameScreen';
import WinScreen from '../screens/WinScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
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
            fontSize: 20,
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
          options={{ 
            title: 'Memory Challenge',
            headerStyle: {
              backgroundColor: '#10b981',
            }
          }}
        />
        <Stack.Screen 
          name="Win" 
          component={WinScreen}
          options={{ 
            title: 'Congratulations!',
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;