// Centered banner with AAA scale animation
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

export default function WaveAnouncer({ waveId }: Readonly<{ waveId: number }>) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  
  useEffect(() => {
    // Pop in animation
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 300 });
  }, [waveId]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View 
      pointerEvents="none" 
      style={WaveAnouncerLocalStyles.container}
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
    >
      <Animated.View style={animatedStyle}>
        <Text style={WaveAnouncerLocalStyles.title}>Wave {waveId}</Text>
        <Text style={WaveAnouncerLocalStyles.subtitle}>Get Ready</Text>
      </Animated.View>
    </Animated.View>
  );
}

const WaveAnouncerLocalStyles = StyleSheet.create({
	container: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.6)',
		zIndex: 1000,
	},
	title: {
		fontSize: 48,
		color: '#fff',
		marginBottom: 12,
		fontWeight: '700',
		fontFamily: 'OrbitronBold',
		textAlign: 'center',
		// Neon glow effect
		textShadowColor: 'rgba(0, 220, 255, 0.3)',
		textShadowOffset: { width: 0, height: 0 },
		textShadowRadius: 5,
	},
	subtitle: {
		fontSize: 20,
		color: '#fff',
		opacity: 0.9,
		fontFamily: 'Orbitron',
		textAlign: 'center',
		// Subtle glow
		textShadowColor: 'rgba(162, 171, 88, 0.3)',
		textShadowOffset: { width: 0, height: 0 },
		textShadowRadius: 5,
	},
});