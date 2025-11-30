import { Pressable, StyleSheet, View } from 'react-native';
import { Volume2, VolumeX } from 'lucide-react-native';
import { useStore } from '@/store/store';

interface AudioControlsProps {
  size?: number;
}

export function AudioControls({ size = 30 }: AudioControlsProps) {
  const soundOn = useStore((state) => state.soundOn);
  const toggleSound = useStore((state) => state.toggleSound);
  
  // Convert soundOn (true = unmuted) to muted (true = muted)
  const muted = !soundOn;

  return (
    <View style={styles.audioControls}>
      <Pressable 
        onPress={toggleSound}
        accessibilityRole="button"
        accessibilityLabel={muted ? 'Unmute' : 'Mute'}
        hitSlop={8}
      >
        {muted ? (
          <VolumeX
            color="#ffffff"
            size={size}
          />
        ) : (
          <Volume2
            color="#ffffff"
            size={size}
          />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  audioControls: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
  },
});
