// Power-up indicator showing active boosts
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useStore } from '@/store/store';

export default function PowerUpIndicator() {
  const doubleShot = useStore((state) => state.booster.doubleShot);
  
  if (!doubleShot) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={styles.container}
      entering={FadeIn.duration(400)}
      exiting={FadeOut.duration(300)}
    >
      <View style={styles.badge}>
        <Text style={styles.icon}>⚡</Text>
        <Text style={styles.text}>DOUBLE SHOT</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    zIndex: 5, // Behind ship to avoid overlap
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.8)',
  },
  icon: {
    fontSize: 18,
    marginRight: 6,
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFD700',
    fontFamily: 'OrbitronBold',
    // Gold glow
    textShadowColor: 'rgba(255, 215, 0, 0.9)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});

