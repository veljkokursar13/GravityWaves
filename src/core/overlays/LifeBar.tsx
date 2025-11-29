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
import { useStore } from '@/store/store';

const MAX_LIVES = 3;

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
    <Animated.Image
      source={require('../../assets/images/ship.png')}
      style={[styles.heart, animatedStyle]}
    />
  );
};

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
    overlayColor: 'rgba(0, 0, 0, 0.5)',
    
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

const LifeBar = () => {
  const lives = useStore((s) => s.lives);
  const isInvincible = useStore((s) => s.booster.shield);

  if (lives === 0) return null;

  return (
    <View style={styles.container}>
      <View style={[styles.heartsRow, { opacity: 0.7 }]}>
        {Array.from({ length: MAX_LIVES }).map((_, index) => (
          <HeartIcon
            key={index}
            filled={index < lives}
            isInvincible={isInvincible}
          />
        ))}
      </View>
    </View>
  );
};

export default LifeBar;