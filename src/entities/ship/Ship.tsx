// Ship rendering component
import React, { useCallback, useMemo } from 'react';
import { Image, useImage } from '@shopify/react-native-skia';
import type { Ship as ShipType } from './types';
import useShipControls from './ShipControlls';
 
interface ShipProps {
  ship: ShipType;
  velocityX?: number; // kept for API compatibility; not used
  bounds?: { width: number; height: number };
  onMove?: (x: number, y: number) => void;
}
 
export default function Ship({ ship, velocityX: _velocityX = 0, bounds, onMove }: Readonly<ShipProps>) {
  const shipImage = useImage(require('../../assets/images/ship.png'));
  
  const effectiveBounds = useMemo(
    () => bounds ?? { width: Number.MAX_SAFE_INTEGER, height: Number.MAX_SAFE_INTEGER },
    [bounds]
  );
  const effectiveOnMove = useCallback(
    (x: number, y: number) => {
      onMove?.(x, y);
    },
    [onMove]
  );
  const { touchHandlers } = useShipControls({
    ship,
    onMove: effectiveOnMove,
    bounds: effectiveBounds,
  });
  
  if (!shipImage) return null;
 
  return (
    <Image
      {...(onMove ? touchHandlers : {})}
      image={shipImage}
      x={ship.x - ship.width / 2}
      y={ship.y - ship.height / 2}
      width={ship.width}
      height={ship.height}
      fit="contain"
    />
  );
}