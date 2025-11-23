// Ship rendering component with banking animation
import { Group, Image, useImage } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import type { Ship as ShipType } from './types';

interface ShipProps {
  ship: ShipType;
  velocityX: number;
}

const MAX_LEAN_RADIANS = 0.18; // Max tilt angle

export default function Ship({ ship, velocityX }: Readonly<ShipProps>) {
  const shipImage = useImage(require('../../assets/images/ship.png'));

  // Banking animation: ship tilts when moving horizontally
  const leanAngle = useMemo(() => {
    // Normalize velocity to -1...1 range
    const normalized = Math.max(-1, Math.min(1, velocityX / 400));
    return normalized * MAX_LEAN_RADIANS * (Math.PI / 180);
  }, [velocityX]);

  if (!shipImage) return null;

  return (
    <Group
      transform={[
        { translateX: ship.x },
        { translateY: ship.y },
        { skewX: leanAngle }, // Rotate for banking effect
        { translateX: -ship.width / 2 },
        { translateY: -ship.height / 2 },
      ]}
    >
      <Image image={shipImage} x={0} y={0} width={ship.width} height={ship.height} fit="contain" />
    </Group>
  );
}