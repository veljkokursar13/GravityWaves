// Ship rendering component
import React from 'react';
import { Image, useImage } from '@shopify/react-native-skia';
import type { Ship as ShipType } from './types';
 
interface ShipProps {
  ship: ShipType;
  velocityX?: number; // kept for API compatibility; not used
}
 
export default function Ship({ ship, velocityX: _velocityX = 0 }: ShipProps) {
  const shipImage = useImage(require('../../assets/images/ship.png'));
  if (!shipImage) return null;
 
  return (
    <Image
      image={shipImage}
      x={ship.x - ship.width / 2}
      y={ship.y - ship.height / 2}
      width={ship.width}
      height={ship.height}
      fit="contain"
    />
  );
}