// Life bar display showing remaining lives
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { useEffect } from 'react';

interface LifeBarProps {
  lives: number;
  maxLives: number;
  isInvincible: boolean;
}

const HeartIcon = ({ filled, isInvincible }: { filled: boolean; isInvincible: boolean }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!filled) {
      // Pulse out when life is lost
      scale.value = withSequence(
        withSpring(1.5),
        withSpring(0.8)
      );
      opacity.value = withTiming(0.3, { duration: 200 });
    } else {
      scale.value = withSpring(1);
      opacity.value = withTiming(1, { duration: 200 });
    }
  }, [filled]);

  useEffect(() => {
    if (isInvincible && filled) {
      // Flash when invincible
      opacity.value = withSequence(
        withTiming(0.4, { duration: 150 }),
        withTiming(1, { duration: 150 })
      );
    }
  }, [isInvincible, filled]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.heart, animatedStyle]}>
      <View style={[
        styles.heartFill,
        { backgroundColor: filled ? '#ff0055' : 'rgba(255, 0, 85, 0.2)' }
      ]} />
    </Animated.View>
  );
};

export default function LifeBar({ lives, maxLives, isInvincible }: LifeBarProps) {
  return (
    <View pointerEvents="none" style={styles.container}>
      <View style={styles.heartsRow}>
        {Array.from({ length: maxLives }).map((_, i) => (
          <HeartIcon 
            key={i} 
            filled={i < lives} 
            isInvincible={isInvincible && i < lives}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 5, // Behind ship to avoid overlap
  },
  heartsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  heart: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartFill: {
    width: 20,
    height: 20,
    borderRadius: 12,
    // Simple heart shape using circle (could be enhanced with SVG)
    shadowColor: '#ff0055',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
});

