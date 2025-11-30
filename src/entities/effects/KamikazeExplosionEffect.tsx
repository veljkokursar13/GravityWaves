// Kamikaze explosion effect component
import { Circle, Group, BlurMask } from '@shopify/react-native-skia';
import { useEffect, useState } from 'react';

interface KamikazeExplosionEffectProps {
  x: number;
  y: number;
  time: number; // Time since explosion started
}

const EXPLOSION_DURATION = 0.5; // 500ms

export default function KamikazeExplosionEffect({ x, y, time }: KamikazeExplosionEffectProps) {
  // Don't render if expired
  if (time >= EXPLOSION_DURATION) {
    return null;
  }

  // Progress from 0 to 1
  const progress = time / EXPLOSION_DURATION;
  
  // Expand then contract
  const scale = progress < 0.5 
    ? progress * 2 // 0 to 1
    : 2 - progress * 2; // 1 to 0
  
  const maxRadius = 80;
  const radius = scale * maxRadius;
  
  // Fade out
  const opacity = 1 - progress;

  return (
    <Group>
      {/* Gravity distortion ring (expanding blue ring) - outermost */}
      <Circle 
        cx={x} 
        cy={y} 
        r={radius * 2.5} 
        opacity={opacity * 0.25} 
        color="rgba(100, 150, 255, 0.7)"
        style="stroke"
        strokeWidth={5}
      >
        <BlurMask blur={30} style="outer" />
      </Circle>
      
      {/* Secondary gravity wave */}
      <Circle 
        cx={x} 
        cy={y} 
        r={radius * 2.0} 
        opacity={opacity * 0.3} 
        color="rgba(150, 200, 255, 0.6)"
        style="stroke"
        strokeWidth={4}
      >
        <BlurMask blur={20} style="outer" />
      </Circle>
      
      {/* Outer shockwave ring (red/orange) */}
      <Circle cx={x} cy={y} r={radius * 1.5} opacity={opacity * 0.3} color="rgba(255, 100, 100, 0.8)">
        <BlurMask blur={20} style="solid" />
      </Circle>
      
      {/* Mid ring */}
      <Circle cx={x} cy={y} r={radius} opacity={opacity * 0.6} color="rgba(255, 150, 50, 0.9)">
        <BlurMask blur={15} style="solid" />
      </Circle>
      
      {/* Core */}
      <Circle cx={x} cy={y} r={radius * 0.5} opacity={opacity} color="rgba(255, 255, 200, 1)">
        <BlurMask blur={10} style="solid" />
      </Circle>
    </Group>
  );
}
