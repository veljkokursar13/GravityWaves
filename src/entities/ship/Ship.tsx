// Ship rendering component with banking animation
import { Group, Image, useImage } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import type { Ship as ShipType } from './types';

interface ShipProps {
  ship: ShipType;
  velocityX: number;
  isInvincible?: boolean;
}

const MAX_SKEW = 0.08; // perfect subtle lean

export default function Ship({ ship, velocityX, isInvincible = false }: Readonly<ShipProps>) {
  const shipImage = useImage(require('../../assets/images/ship.png'));

  const lean = useMemo(() => {
    const normalized = Math.max(-1, Math.min(1, velocityX / 400));
    return normalized * MAX_SKEW;
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
        { skewX: lean }, // Leaning effect
        { translateX: -ship.width / 2 },
        { translateY: -ship.height / 2 },
      ]}
    >
      {/* Ship sprite */}
      <Image
        image={shipImage}
        x={0}
        y={0}
        width={ship.width}
        height={ship.height}
        fit="contain"
      />
    </Group>
  );
}