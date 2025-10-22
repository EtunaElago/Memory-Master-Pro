import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Animated, StyleSheet } from 'react-native';
import colors from '../styles/colors';
import spacing from '../styles/spacing';

const Card = ({ item, isFlipped, isMatched, onPress, disabled }) => {
  const flipAnimation = useRef(new Animated.Value(0)).current;
  
  let flipRotation = 0;
  flipAnimation.addListener(({ value }) => {
    flipRotation = value;
  });

  const flipToFrontStyle = {
    transform: [
      {
        rotateY: flipAnimation.interpolate({
          inputRange: [0, 180],
          outputRange: ['0deg', '180deg']
        })
      }
    ]
  };

  const flipToBackStyle = {
    transform: [
      {
        rotateY: flipAnimation.interpolate({
          inputRange: [0, 180],
          outputRange: ['180deg', '360deg']
        })
      }
    ]
  };

  useEffect(() => {
    if (isFlipped || isMatched) {
      Animated.timing(flipAnimation, {
        toValue: 180,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(flipAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isFlipped, isMatched]);

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      disabled={disabled || isFlipped || isMatched}
    >
      <Animated.View style={[styles.card, styles.cardFront, flipToFrontStyle]}>
        <Animated.Text style={styles.cardText}>
          {item.value}
        </Animated.Text>
      </Animated.View>
      
      <Animated.View style={[styles.card, styles.cardBack, flipToBackStyle]}>
        <Animated.Text style={styles.cardBackText}>?</Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 70,
    height: 70,
    margin: spacing.xs,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    backfaceVisibility: 'hidden',
  },
  cardFront: {
    backgroundColor: colors.primary,
  },
  cardBack: {
    backgroundColor: colors.gray,
  },
  cardText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  cardBackText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
});

export default Card;