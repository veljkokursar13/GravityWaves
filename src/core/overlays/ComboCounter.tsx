// Combo counter with multiplier display
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withTiming,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';
import { useEffect } from 'react';

interface ComboCounterProps {
  combo: number;
  multiplier: number;
}

export default function ComboCounter({ combo, multiplier }: ComboCounterProps) {
  const scale = useSharedValue(1);
  const glowIntensity = useSharedValue(1);

  // Pop animation when combo increases
  useEffect(() => {
    if (combo > 0) {
      scale.value = withSequence(
        withSpring(1.3, { damping: 10, stiffness: 300 }),
        withSpring(1, { damping: 12, stiffness: 200 })
      );
      glowIntensity.value = withSequence(
        withTiming(2, { duration: 100 }),
        withTiming(1, { duration: 300 })
      );
    }
  }, [combo]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    textShadowRadius: 15 * glowIntensity.value,
  }));

  if (combo < 2) return null; // Only show combo after 2+ kills

  return (
    <Animated.View
      pointerEvents="none"
      style={styles.container}
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(300)}
    >
      <Animated.View style={animatedStyle}>
        <Animated.Text style={[styles.comboText, glowStyle]}>
          {combo} COMBO
        </Animated.Text>
        {multiplier > 1 && (
          <Animated.Text style={[styles.multiplierText, glowStyle]}>
            x{multiplier.toFixed(1)}
          </Animated.Text>
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 20,
    alignItems: 'center',
    zIndex: 100,
  },
  multiplierText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffff00',
    fontFamily: 'Orbitron',
    textAlign: 'left',
    marginTop: 4,
    // Yellow glow for multiplier
    textShadowColor: 'rgba(255, 255, 0, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
});

