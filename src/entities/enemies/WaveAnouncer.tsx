// Tiny overlay that announces the next wave
import { View, Text, StyleSheet } from 'react-native';
import { useFonts } from '@/hooks/useFonts';
export function WaveAnouncer({ wave, visible }: { wave: number; visible: boolean }) {
  const { fontsLoaded } = useFonts();
  if (!fontsLoaded || !visible) return null;
  return (
    <View pointerEvents="none" style={styles.container}>
      <Text style={styles.text}>Wave {wave}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 3000,
  },
  text: {
    fontFamily: 'Quantico',
    fontSize: 24,
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});