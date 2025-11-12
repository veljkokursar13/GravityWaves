import { View, Pressable, StyleSheet } from 'react-native';
import { Volume2, VolumeX } from 'lucide-react-native';
import { useAudioStore } from '@/store/audio';
import { useAudio } from '@/hooks/useAudio';

export function AudioControls() {
  const { muted, setMuted } = useAudioStore();

  return (
    <View style={styles.audioControls}>
      <Pressable onPress={() => setMuted(!muted)}>
        {muted ? <VolumeX color="#ffffff" size={30} /> : <Volume2 color="#ffffff" size={30} />}
      </Pressable>
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
});

