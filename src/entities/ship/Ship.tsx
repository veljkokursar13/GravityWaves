// Ship rendering component
import React from 'react';
import { Group, Image, useImage } from '@shopify/react-native-skia';
import type { Ship as ShipType } from './types';

interface ShipProps {
  ship: ShipType;
  velocityX?: number; // Horizontal velocity for tilt
}

export default function Ship({ ship, velocityX = 0 }: ShipProps) {
  const shipImage = useImage(require('../../assets/images/ship.png'));
  
  if (!shipImage) return null;

  // Banking/leaning effect - skew creates perspective (no rotation)
  const maxSkew = 0.2; // Increased for more visible banking
  const skewX = Math.max(-maxSkew, Math.min(maxSkew, velocityX * 0.003));
  
  // Slight scale on X axis for depth effect
  const scaleX = 1 - Math.abs(velocityX * 0.0008);

  return (
    <Group
      transform={[
        { translateX: ship.x },
        { translateY: ship.y },
        { skewX: skewX },                         // Banking/leaning effect only
        { scaleX: Math.max(0.8, scaleX) },       // Depth effect
      ]}
    >
      <Image
        image={shipImage}
        x={-ship.width / 2}
        y={-ship.height / 2}
        width={ship.width}
        height={ship.height}
        fit="contain"
      />
    </Group>
  );
}