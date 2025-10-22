import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  Alert 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Card from '../components/Card';
import { createCards, checkMatch, checkWinCondition } from '../utils/gameUtils';
import colors from '../styles/colors';
import typography from '../styles/typography';
import spacing from '../styles/spacing';
import SoundManager from '../utils/soundUtils';

const GameScreen = ({ route }) => {
  const navigation = useNavigation();
  const { difficulty = 'easy' } = route.params || {};
  
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [time, setTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [timerActive, setTimerActive] = useState(false);

  // Initialize sound when component mounts
  useEffect(() => {
    const initSound = async () => {
      await SoundManager.initialize();
      await SoundManager.playBackgroundMusic();
    };
    initSound();
  }, []);

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, [difficulty]);

  // Timer
  useEffect(() => {
    let interval;
    if (timerActive) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const initializeGame = () => {
    const newCards = createCards(difficulty);
    setCards(newCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setTime(0);
    setGameStarted(false);
    setTimerActive(false);
  };

  const startGame = () => {
    setGameStarted(true);
    setTimerActive(true);
  };

  const handleCardFlip = async (card) => {
    await SoundManager.playCardFlip();
  };

  const handleMatch = async (isMatch) => {
    if (isMatch) {
      await SoundManager.playMatchSuccess();
      await SoundManager.playMemoryRecall();
    } else {
      await SoundManager.playMatchFail();
    }
  };

  const handleGameWin = async () => {
    await SoundManager.playGameWin();
    await SoundManager.playLevelUp();
  };

  const handleCardPress = async (card) => {
    if (!gameStarted) {
      startGame();
    }

    // Don't allow flipping if card is already flipped, matched, or two cards are already flipped
    if (card.flipped || card.matched || flippedCards.length === 2) {
      return;
    }

    // Play card flip sound
    await handleCardFlip(card);

    // Flip the card
    const updatedCards = cards.map(c => 
      c.id === card.id ? { ...c, flipped: true } : c
    );
    setCards(updatedCards);

    const newFlippedCards = [...flippedCards, card];
    setFlippedCards(newFlippedCards);

    // Check for match when two cards are flipped
    if (newFlippedCards.length === 2) {
      const newMoves = moves + 1;
      setMoves(newMoves);
      
      const [card1, card2] = newFlippedCards;
      const isMatch = checkMatch(card1, card2);
      
      if (isMatch) {
        // Match found
        await handleMatch(true);
        
        setTimeout(() => {
          const matchedCards = updatedCards.map(c =>
            c.value === card1.value ? { ...c, matched: true } : c
          );
          setCards(matchedCards);
          const newMatches = matches + 1;
          setMatches(newMatches);
          setFlippedCards([]);

          // Check for win
          if (checkWinCondition(matchedCards)) {
            setTimerActive(false);
            handleGameWin();
            navigation.navigate('Win', {
              moves: newMoves,
              time,
              matches: newMatches,
              difficulty
            });
          }
        }, 500);
      } else {
        // No match - flip cards back
        await handleMatch(false);
        
        setTimeout(() => {
          const resetCards = updatedCards.map(c =>
            newFlippedCards.some(fc => fc.id === c.id) ? { ...c, flipped: false } : c
          );
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const getGridColumns = () => {
    switch (difficulty) {
      case 'easy': return 4;
      case 'medium': return 4;
      case 'hard': return 4;
      default: return 4;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Moves</Text>
            <Text style={styles.statValue}>{moves}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Time</Text>
            <Text style={styles.statValue}>{formatTime(time)}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Matches</Text>
            <Text style={styles.statValue}>{matches}</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={cards}
        keyExtractor={(item) => item.id.toString()}
        numColumns={getGridColumns()}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <Card
            item={item}
            isFlipped={item.flipped}
            isMatched={item.matched}
            onPress={() => handleCardPress(item)}
            disabled={flippedCards.length === 2}
          />
        )}
      />

      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={initializeGame}
        >
          <Text style={styles.buttonText}>Restart Game</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    ...typography.caption,
    color: colors.gray,
  },
  statValue: {
    ...typography.h2,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  grid: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  controls: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 25,
    minWidth: 150,
  },
  buttonText: {
    ...typography.button,
    color: colors.white,
  },
});

export default GameScreen;