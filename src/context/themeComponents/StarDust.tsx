// Star dust particles moving from right to left across the screen
import { Canvas, Circle } from '@shopify/react-native-skia';
import { StyleSheet } from 'react-native';
import { useStarDust } from '../../core/systems/useStarDust';
import { memo } from 'react';

const StarDust = memo(() => {
  const dust = useStarDust();

  return (
    <Canvas style={styles.canvas} pointerEvents="none">
      {dust.map((particle) => (
        <Circle
          key={particle.id}
          cx={particle.x}
          cy={particle.y}
          r={particle.size}
          color={particle.color}
          opacity={particle.opacity}
        />
      ))}
    </Canvas>
  );
});

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2, // Above stars (1) and nebula (0)
  },
});

export default StarDust;