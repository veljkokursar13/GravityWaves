import { Pressable, View, StyleSheet } from "react-native";
import { Text as RNText } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withTiming,
  withRepeat
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { useFonts } from '@/hooks/useFonts';

// AAA Button with scale animation and neon pulse
export const AnimatedButton = ({ children, onPress }: { children: React.ReactNode, onPress: () => void }) => {
  const { fontsLoaded } = useFonts();
  const scale = useSharedValue(1);
  const borderOpacity = useSharedValue(0.8);
  
  // Subtle neon pulse effect
  useEffect(() => {
    borderOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0.6, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);
  
  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const borderAnimatedStyle = useAnimatedStyle(() => ({
    opacity: borderOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable 
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }: { pressed: boolean }) => [styles.inner, pressed && styles.innerPressed]}
      >
        <RNText style={styles.text}>{children}</RNText>
      </Pressable>

      {/* Absolute overlay so all edges are visible above content */}
      <Animated.View pointerEvents="none" style={[styles.borderWrapper, borderAnimatedStyle]}>
        <LinearGradient pointerEvents="none" colors={['#636363', '#a2ab58']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.topEdge} />
        <LinearGradient pointerEvents="none" colors={['#636363', '#a2ab58']} start={{ x: 1, y: 0 }} end={{ x: 0, y: 0 }} style={styles.bottomEdge} />
        <LinearGradient pointerEvents="none" colors={['#636363', '#a2ab58']} start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }} style={styles.leftEdge} />
        <LinearGradient pointerEvents="none" colors={['#636363', '#a2ab58']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.rightEdge} />
      </Animated.View>
    </Animated.View>
  );
}

const BORDER = 2;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 5,
    overflow: 'hidden',
    marginVertical: 12, // larger gap between elements
  },
  borderWrapper: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  // edges create the gradient border while center stays transparent
  topEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: BORDER,
  },
  bottomEdge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: BORDER,
  },
  leftEdge: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: BORDER,
  },
  rightEdge: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: BORDER,
  },
  inner: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  innerPressed: {
    backgroundColor: 'rgba(162,171,88,0.15)',
  },
    text: {
        color: 'white',
      fontSize: 18,
      fontFamily: 'OrbitronBold',
      textAlign: 'center',
      // AAA text glow
      textShadowColor: 'rgba(162, 171, 88, 0.8)',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
    },
});