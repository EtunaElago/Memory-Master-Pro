import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import colors from '../styles/colors';
import typography from '../styles/typography';
import spacing from '../styles/spacing';
import adManager from '../services/ads';
import SoundManager from '../utils/soundUtils';

const HomeScreen = ({ navigation }) => {
  const difficulties = [
    { key: 'easy', name: 'Easy', pairs: 8, description: '4x4 grid - Perfect for beginners' },
    { key: 'medium', name: 'Medium', pairs: 12, description: '4x6 grid - A good challenge' },
    { key: 'hard', name: 'Hard', pairs: 16, description: '4x8 grid - For memory masters' },
  ];

  // Start background music when app opens
  useEffect(() => {
    const startMusic = async () => {
      await SoundManager.initialize();
      await SoundManager.playBackgroundMusic();
    };
    startMusic();
  }, []);

  const BannerAd = adManager.BannerAdComponent;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Memory Master</Text>
          <Text style={styles.subtitle}>Train Your Brain</Text>
        </View>

        <View style={styles.mainContent}>
          <Text style={styles.sectionTitle}>Select Difficulty</Text>
          
          {difficulties.map((difficulty) => (
            <TouchableOpacity
              key={difficulty.key}
              style={styles.difficultyCard}
              onPress={() => navigation.navigate('Game', { difficulty: difficulty.key })}
            >
              <View style={styles.difficultyHeader}>
                <Text style={styles.difficultyName}>{difficulty.name}</Text>
                <Text style={styles.difficultyPairs}>{difficulty.pairs} pairs</Text>
              </View>
              <Text style={styles.difficultyDescription}>{difficulty.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.features}>
          <Text style={styles.sectionTitle}>Features</Text>
          
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🎯</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Track Progress</Text>
                <Text style={styles.featureDescription}>Monitor your moves, time, and efficiency</Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>⚡</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Multiple Levels</Text>
                <Text style={styles.featureDescription}>Progress from easy to expert challenges</Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🧠</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Brain Training</Text>
                <Text style={styles.featureDescription}>Improve your memory and concentration</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Banner Ad at bottom */}
      <BannerAd style={styles.bannerAd} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  bannerAd: {
    alignSelf: 'center',
    marginBottom: 10,
  },
  header: {
    backgroundColor: colors.primary,
    padding: spacing.xl,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    ...typography.h1,
    color: colors.white,
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.white,
    fontSize: 18,
    opacity: 0.9,
  },
  mainContent: {
    padding: spacing.xl,
  },
  sectionTitle: {
    ...typography.h2,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  difficultyCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 16,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  difficultyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  difficultyName: {
    ...typography.h3,
    color: colors.primary,
  },
  difficultyPairs: {
    ...typography.caption,
    color: colors.gray,
    backgroundColor: colors.lightGray,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  difficultyDescription: {
    ...typography.body,
    color: colors.gray,
  },
  features: {
    padding: spacing.xl,
    paddingTop: 0,
  },
  featureList: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    ...typography.caption,
    color: colors.gray,
  },
});

export default HomeScreen;