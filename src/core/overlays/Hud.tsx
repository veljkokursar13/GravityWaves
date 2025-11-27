//Hud shows only the score (top-left) with AAA glow
import { View, Text, StyleSheet } from 'react-native';
import { useScore } from '@/hooks/useScore';
import { useFonts } from '@/hooks/useFonts';

export default function Hud() {
  const { score } = useScore();
  const { fontsLoaded } = useFonts();
  if (!fontsLoaded) return null;
  return (
    <View pointerEvents="none" style={styles.hud}>
      <View style={styles.pill}>
        <Text style={styles.line}>Score: {score}</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
    hud: {
        position: 'absolute',
        top: 55,
        left: 12,
        width: '100%',
    },
    pill: {
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    line: {
        fontSize: 24,
        color: '#fff',
        fontFamily: 'OrbitronBold',
        // AAA text glow effect
        textShadowColor: 'rgba(0, 220, 255, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
});
