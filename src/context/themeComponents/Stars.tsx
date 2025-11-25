// Stars with Skia rendering and varied bloom glow on ~10% of stars
import { StyleSheet, useWindowDimensions } from 'react-native';
import { useStarsLayers } from '../../core/systems/useStars';
import { memo } from 'react';
import type { Star } from '../../core/systems/useStars';
import { Canvas, Circle, BlurMask } from '@shopify/react-native-skia';

// Render a single star with optional color-based glow and bottom fade
const renderStar = (star: Star, baseOpacity: number, screenHeight: number) => {
  // Brighter stars (higher opacity layers) get stronger glow boost
  const brightnessBoost = baseOpacity > 0.7 ? 1.5 : 1.0;
  
  // Fade stars near bottom for cleaner UI area
  const fade = Math.min(1, (star.y / screenHeight) * 1.5);
  const finalOpacity = baseOpacity * fade;
  
  // Dynamic blur calculation with varied intensity
  const blurAmount = star.hasGlow 
    ? star.size * star.glowIntensity * brightnessBoost * 3
    : 0;
  
  // Add subtle cyan/blue tint to glowing stars for color variety
  const starColor = star.hasGlow && star.glowIntensity > 1.5
    ? `rgba(180, 220, 255, ${finalOpacity})` // Brighter cyan for strong glow
    : star.color;
  
  return (
    <Circle 
      key={star.id} 
      cx={star.x} 
      cy={star.y} 
      r={star.size} 
      color={starColor} 
      opacity={finalOpacity}
    >
      {star.hasGlow && <BlurMask blur={blurAmount} style="solid" />}
    </Circle>
  );
};

export const Stars = memo(() => {
  const { backgroundStars, farStars, nearStars } = useStarsLayers();
  const { height } = useWindowDimensions();

  return (
    <Canvas style={styles.canvas} pointerEvents="none">
      {backgroundStars.map(star => renderStar(star, 0.4, height))}
      {farStars.map(star => renderStar(star, 0.6, height))}
      {nearStars.map(star => renderStar(star, 0.9, height))}
    </Canvas>
  );
});

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
});
