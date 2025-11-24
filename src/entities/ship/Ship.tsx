// Ship rendering component with banking animation
import { Group, Image, useImage } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import type { Ship as ShipType } from './types';

interface ShipProps {
  ship: ShipType;
  velocityX: number;
  isInvincible?: boolean;
}

const MAX_ROTATION_DEG = 20; // Max tilt angle in degrees (±20°)

export default function Ship({ ship, velocityX, isInvincible = false }: Readonly<ShipProps>) {
  const shipImage = useImage(require('../../assets/images/ship.png'));

  // Banking animation: ship rotates when moving horizontally using atan for natural arc
  const leanAngle = useMemo(() => {
    // Use atan for natural banking curve, scale by 0.8 for subtle effect
    const rotation = Math.atan(velocityX) * 0.8;
    // Clamp to ±20 degrees (convert to radians)
    const maxRadians = (MAX_ROTATION_DEG * Math.PI) / 180;
    return Math.max(-maxRadians, Math.min(maxRadians, rotation));
  }, [velocityX]);

  // Flicker effect when invincible (alternates opacity every ~150ms)
  // Recalculates each frame to create visual flicker effect
  const opacity = isInvincible 
    ? (Math.floor(Date.now() / 150) % 2 === 0 ? 0.4 : 1.0)
    : 1.0;

  if (!shipImage) return null;

  return (
    <Group
      opacity={opacity}
      transform={[
        { translateX: ship.x },
        { translateY: ship.y },
        { rotate: leanAngle }, // Proper rotation for banking effect
        { translateX: -ship.width / 2 },
        { translateY: -ship.height / 2 },
      ]}
    >
      <Image image={shipImage} x={0} y={0} width={ship.width} height={ship.height} fit="contain" />
    </Group>
  );
}