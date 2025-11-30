// Epic boss intro cinematic
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutUp
} from 'react-native-reanimated';
import { useEffect } from 'react';

interface BossIntroProps {
  bossName?: string;
  onComplete: () => void;
}

const INTRO_DURATION = 3000; // 3 seconds

export default function BossIntro({ bossName = 'BOSS', onComplete }: BossIntroProps) {
  const scale = useSharedValue(0.5);
  const glowPulse = useSharedValue(1);

  useEffect(() => {
    // Dramatic entrance animation
    scale.value = withSequence(
      withSpring(1.2, { damping: 8, stiffness: 100 }),
      withSpring(1, { damping: 12, stiffness: 150 })
    );

    // Pulsing glow effect
    glowPulse.value = withSequence(
      withTiming(2, { duration: 500 }),
      withTiming(1, { duration: 500 }),
      withTiming(1.5, { duration: 500 }),
      withTiming(1, { duration: 500 })
    );

    // Auto-complete after duration
    const timeout = setTimeout(onComplete, INTRO_DURATION);
    return () => clearTimeout(timeout);
  }, [onComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    textShadowRadius: 20 * glowPulse.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={styles.container}
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(500)}
    >
      {/* Warning bars */}
      <Animated.View 
        style={styles.warningBar}
        entering={SlideInDown.duration(400)}
        exiting={SlideOutUp.duration(300)}
      />
      <Animated.View 
        style={[styles.warningBar, styles.warningBarBottom]}
        entering={SlideInDown.duration(400).delay(100)}
        exiting={SlideOutUp.duration(300)}
      />

      {/* Boss warning text */}
      <Animated.View style={animatedStyle}>
        <Animated.Text style={[styles.warningText, glowStyle]}>
          WARNING
        </Animated.Text>
        <Animated.Text style={[styles.bossText, glowStyle]}>
          {bossName}
        </Animated.Text>
        <Animated.Text style={[styles.subtitle, glowStyle]}>
          APPROACHING
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 9997, // High z-index for boss intro overlay
    elevation: 9997, // For Android
  },
  warningBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#ff0000',
    shadowColor: '#ff0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  warningBarBottom: {
    top: 'auto',
    bottom: 0,
  },
  warningText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ff0000',
    fontFamily: 'OrbitronBold',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 4,
    textShadowColor: '#ff0000',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  bossText: {
    fontSize: 64,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'OrbitronBold',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 2,
    // Epic red/orange glow
    textShadowColor: '#ff4400',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Orbitron',
    textAlign: 'center',
    letterSpacing: 3,
    textShadowColor: 'rgba(255, 68, 0, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
});

