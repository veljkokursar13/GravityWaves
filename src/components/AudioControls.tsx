import { View, Pressable, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { Volume2, VolumeX } from 'lucide-react-native';
import { useStore } from '@/store/store';

// Neon thin-line volume icon component
function VolumeIcon({ muted }: { muted: boolean }) {
  return muted ? (
    <VolumeX
      color="#ffffff"
      size={30}
      textShadowColor="rgba(0, 220, 255, 0.5)"
      textShadowOffset={{ width: 0, height: 0 }}
      textShadowRadius={10}
    />
  ) : (
    <Volume2
      color="#ffffff"
      size={30}
      textShadowColor="rgba(0, 220, 255, 0.5)"
      textShadowOffset={{ width: 0, height: 0 }}
      textShadowRadius={10}
    />
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
    right: 15,
    zIndex: 10,
  },
  button: {
    padding: 8,
  },
});

