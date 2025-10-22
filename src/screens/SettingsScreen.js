import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SoundManager from '../utils/soundUtils';
import colors from '../styles/colors';
import typography from '../styles/typography';
import spacing from '../styles/spacing';

const SettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    soundEnabled: true,
    musicEnabled: true,
    hapticsEnabled: true,
    notificationsEnabled: true,
    difficulty: 'medium',
    theme: 'default'
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('@memory_master_settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        
        // Apply sound settings
        SoundManager.toggleSound(parsedSettings.soundEnabled);
        SoundManager.toggleHaptics(parsedSettings.hapticsEnabled);
        
        if (parsedSettings.musicEnabled && parsedSettings.soundEnabled) {
          SoundManager.playBackgroundMusic();
        } else {
          SoundManager.stopBackgroundMusic();
        }
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      setSettings(newSettings);
      await AsyncStorage.setItem('@memory_master_settings', JSON.stringify(newSettings));
      
      // Apply immediately
      SoundManager.toggleSound(newSettings.soundEnabled);
      SoundManager.toggleHaptics(newSettings.hapticsEnabled);
      
      if (newSettings.musicEnabled && newSettings.soundEnabled) {
        SoundManager.playBackgroundMusic();
      } else {
        SoundManager.stopBackgroundMusic();
      }
    } catch (error) {
      console.log('Error saving settings:', error);
    }
  };

  const handleToggle = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
    
    // Play test sound for audio toggles
    if (key === 'soundEnabled' && value) {
      SoundManager.playButtonClick();
    }
  };

  const resetProgress = () => {
    Alert.alert(
      'Reset Progress',
      'Are you sure you want to reset all your progress? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                '@memory_master_highscores',
                '@memory_master_stats',
                '@memory_master_progress'
              ]);
              Alert.alert('Success', 'All progress has been reset.');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset progress.');
            }
          }
        }
      ]
    );
  };

  const SettingRow = ({ title, description, children }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      {children}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Audio & Haptics</Text>
        
        <SettingRow 
          title="Sound Effects" 
          description="Game sounds and feedback"
        >
          <Switch
            value={settings.soundEnabled}
            onValueChange={(value) => handleToggle('soundEnabled', value)}
            trackColor={{ false: colors.gray, true: colors.primary }}
            thumbColor={colors.white}
          />
        </SettingRow>

        <SettingRow 
          title="Background Music" 
          description="Ambient music during gameplay"
        >
          <Switch
            value={settings.musicEnabled}
            onValueChange={(value) => handleToggle('musicEnabled', value)}
            trackColor={{ false: colors.gray, true: colors.primary }}
            thumbColor={colors.white}
            disabled={!settings.soundEnabled}
          />
        </SettingRow>

        <SettingRow 
          title="Haptic Feedback" 
          description="Vibration on card flips and matches"
        >
          <Switch
            value={settings.hapticsEnabled}
            onValueChange={(value) => handleToggle('hapticsEnabled', value)}
            trackColor={{ false: colors.gray, true: colors.primary }}
            thumbColor={colors.white}
          />
        </SettingRow>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Game Preferences</Text>
        
        <SettingRow 
          title="Default Difficulty" 
          description="Starting difficulty level"
        >
          <View style={styles.difficultySelector}>
            {['easy', 'medium', 'hard'].map((diff) => (
              <TouchableOpacity
                key={diff}
                style={[
                  styles.difficultyBtn,
                  settings.difficulty === diff && styles.difficultyBtnActive
                ]}
                onPress={() => handleToggle('difficulty', diff)}
              >
                <Text style={[
                  styles.difficultyText,
                  settings.difficulty === diff && styles.difficultyTextActive
                ]}>
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SettingRow>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        
        <SettingRow 
          title="Reset Progress" 
          description="Clear all scores and progress"
        >
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={resetProgress}
          >
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </SettingRow>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Version</Text>
          <Text style={styles.aboutValue}>1.0.0</Text>
        </View>
        
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Developed By</Text>
          <Text style={styles.aboutValue}>Memory Master Team</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    backgroundColor: colors.white,
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    ...typography.h2,
    marginBottom: spacing.lg,
    color: colors.primary,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    ...typography.caption,
    color: colors.gray,
  },
  difficultySelector: {
    flexDirection: 'row',
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: 2,
  },
  difficultyBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
  },
  difficultyBtnActive: {
    backgroundColor: colors.primary,
  },
  difficultyText: {
    ...typography.caption,
    color: colors.gray,
  },
  difficultyTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  resetButtonText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  aboutLabel: {
    ...typography.body,
    color: colors.gray,
  },
  aboutValue: {
    ...typography.body,
    color: colors.text,
  },
});

export default SettingsScreen;