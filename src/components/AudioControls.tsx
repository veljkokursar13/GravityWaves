import { View, Pressable, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { Canvas, Path, Circle } from '@shopify/react-native-skia';
import { useStore } from '@/store/store';

// Neon thin-line volume icon component
function VolumeIcon({ muted }: { muted: boolean }) {
  const size = 30;
  const color = '#00dcff'; // Cyan neon
  
  return (
    <Canvas style={{ width: size, height: size }}>
      {/* Speaker cone */}
      <Path
        path="M8 10 L8 20 L14 24 L14 6 L8 10 Z"
        color={color}
        style="stroke"
        strokeWidth={1.5}
      />
      
      {!muted && (
        <>
          {/* Sound waves */}
          <Path
            path="M18 11 Q20 12, 20 15 Q20 18, 18 19"
            color={color}
            style="stroke"
            strokeWidth={1.5}
          />
          <Path
            path="M22 9 Q25 11, 25 15 Q25 19, 22 21"
            color={color}
            style="stroke"
            strokeWidth={1.5}
          />
        </>
      )}
      
      {muted && (
        <>
          {/* X mark */}
          <Path
            path="M18 10 L26 20"
            color="#ff4444"
            style="stroke"
            strokeWidth={2}
          />
          <Path
            path="M26 10 L18 20"
            color="#ff4444"
            style="stroke"
            strokeWidth={2}
          />
        </>
      )}
      
      {/* Neon glow effect */}
      <Circle cx={15} cy={15} r={14} color={`${color}20`} />
    </Canvas>
  );
}

export function AudioControls() {
  const soundOn = useStore((state) => state.soundOn);
  const toggleSound = useStore((state) => state.toggleSound);
  const scale = useSharedValue(1);
  
  // Convert soundOn (true = unmuted) to muted (true = muted)
  const muted = !soundOn;
  
  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.audioControls}>
      <Animated.View style={animatedStyle}>
        <Pressable 
          onPress={toggleSound}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.button}
        >
          <VolumeIcon muted={muted} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  audioControls: {
    position: 'absolute',
    top: 50,
    right: 25,
    zIndex: 10,
  },
  button: {
    padding: 8,
  },
});

