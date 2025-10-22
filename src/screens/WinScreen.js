import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import colors from '../styles/colors';
import typography from '../styles/typography';
import spacing from '../styles/spacing';

const WinScreen = ({ route, navigation }) => {
  const { moves, time, matches, difficulty } = route.params || {};
  
  const calculateEfficiency = () => {
    const perfectMoves = matches * 2;
    const efficiency = Math.max(0, 100 - ((moves - perfectMoves) / perfectMoves * 100));
    return Math.round(efficiency);
  };

  const getStarRating = (efficiency) => {
    if (efficiency >= 90) return 3;
    if (efficiency >= 75) return 2;
    return 1;
  };

  const efficiency = calculateEfficiency();
  const stars = getStarRating(efficiency);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getPerformanceMessage = () => {
    if (efficiency >= 90) return "Outstanding! You're a memory master!";
    if (efficiency >= 75) return "Great job! Your memory is sharp!";
    if (efficiency >= 60) return "Good work! Keep practicing!";
    return "Nice try! You'll get better with practice!";
  };

  const renderStars = () => {
    const starArray = [];
    for (let i = 0; i < 3; i++) {
      starArray.push(
        <Text key={i} style={[styles.star, i < stars ? styles.starFilled : styles.starEmpty]}>
          {i < stars ? '⭐' : '☆'}
        </Text>
      );
    }
    return starArray;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Congratulations!</Text>
        <Text style={styles.subtitle}>You've matched all pairs!</Text>
        
        <View style={styles.starsContainer}>
          {renderStars()}
        </View>
        
        <Text style={styles.performanceMessage}>
          {getPerformanceMessage()}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Game Statistics</Text>
        
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{moves}</Text>
            <Text style={styles.statLabel}>Moves</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatTime(time)}</Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{matches}</Text>
            <Text style={styles.statLabel}>Pairs</Text>
          </View>
        </View>
        
        <View style={styles.efficiencyContainer}>
          <Text style={styles.efficiencyLabel}>Efficiency Score</Text>
          <Text style={styles.efficiencyValue}>{efficiency}%</Text>
          <View style={styles.efficiencyBar}>
            <View 
              style={[
                styles.efficiencyFill, 
                { width: `${efficiency}%` }
              ]} 
            />
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Game', { difficulty })}
        >
          <Text style={styles.primaryButtonText}>Play Again</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.secondaryButtonText}>Main Menu</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareButtonText}>Share Score</Text>
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
  header: {
    backgroundColor: colors.success,
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
    marginBottom: spacing.lg,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  star: {
    fontSize: 32,
    marginHorizontal: spacing.xs,
  },
  starFilled: {
    color: colors.accent,
  },
  starEmpty: {
    color: colors.white,
    opacity: 0.5,
  },
  performanceMessage: {
    ...typography.body,
    color: colors.white,
    textAlign: 'center',
    fontSize: 16,
  },
  statsContainer: {
    backgroundColor: colors.white,
    margin: spacing.xl,
    padding: spacing.xl,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statsTitle: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xl,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h1,
    color: colors.primary,
    fontSize: 28,
  },
  statLabel: {
    ...typography.caption,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  efficiencyContainer: {
    alignItems: 'center',
  },
  efficiencyLabel: {
    ...typography.body,
    color: colors.gray,
    marginBottom: spacing.sm,
  },
  efficiencyValue: {
    ...typography.h2,
    color: colors.success,
    marginBottom: spacing.md,
  },
  efficiencyBar: {
    width: '100%',
    height: 8,
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  efficiencyFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 4,
  },
  actions: {
    padding: spacing.xl,
    paddingTop: 0,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 18,
  },
  secondaryButton: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.primary,
    fontSize: 18,
  },
  shareButton: {
    backgroundColor: colors.accent,
    padding: spacing.lg,
    borderRadius: 25,
    alignItems: 'center',
  },
  shareButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 18,
  },
});

export default WinScreen;