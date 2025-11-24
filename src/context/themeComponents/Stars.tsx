// Stars with Skia rendering and varied bloom glow on ~10% of stars
import { StyleSheet } from 'react-native';
import { useStarsLayers } from '../../core/systems/useStars';
import { memo } from 'react';
import type { Star } from '../../core/systems/useStars';
import { Canvas, Circle, BlurMask } from '@shopify/react-native-skia';

// Render a single star with optional color-based glow
const renderStar = (star: Star, baseOpacity: number) => {
  // Brighter stars (higher opacity layers) get stronger glow boost
  const brightnessBoost = baseOpacity > 0.7 ? 1.5 : 1.0;
  
  // Dynamic blur calculation with varied intensity
  const blurAmount = star.hasGlow 
    ? star.size * star.glowIntensity * brightnessBoost * 3
    : 0;
  
  // Add subtle cyan/blue tint to glowing stars for color variety
  const starColor = star.hasGlow && star.glowIntensity > 1.5
    ? `rgba(180, 220, 255, ${baseOpacity})` // Brighter cyan for strong glow
    : star.color;
  
  return (
    <Circle 
      key={star.id} 
      cx={star.x} 
      cy={star.y} 
      r={star.size} 
      color={starColor} 
      opacity={baseOpacity}
    >
      {star.hasGlow && <BlurMask blur={blurAmount} style="solid" />}
    </Circle>
  );
};

export const Stars = memo(() => {
  const { backgroundStars, farStars, nearStars } = useStarsLayers();

  return (
    <Canvas style={styles.canvas} pointerEvents="none">
      {backgroundStars.map(star => renderStar(star, 0.4))}
      {farStars.map(star => renderStar(star, 0.6))}
      {nearStars.map(star => renderStar(star, 0.9))}
    </Canvas>
  );
});

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
});
