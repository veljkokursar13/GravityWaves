// Ship rendering component
import { useMemo } from 'react';
import { Group, Image, useImage } from '@shopify/react-native-skia';
import type { Ship as ShipType } from './types';

interface ShipProps {
  ship: ShipType;
  velocityX?: number;
}

const MAX_BANK_RADIANS = 0.35;

export default function Ship({ ship, velocityX = 0 }: Readonly<ShipProps>) {
  const shipImage = useImage(require('../../assets/images/ship.png'));

  const bankAngle = useMemo(() => {
    const normalized = Math.max(-1, Math.min(1, velocityX / 400));
    return normalized * MAX_BANK_RADIANS;
  }, [velocityX]);

  if (!shipImage) return null;

  return (
    <Group
      transform={[
        { translateX: ship.x },
        { translateY: ship.y },
        { rotate: bankAngle },
        { translateX: -ship.width / 2 },
        { translateY: -ship.height / 2 },
      ]}
    >
      <Image image={shipImage} x={0} y={0} width={ship.width} height={ship.height} fit="contain" />
    </Group>
  );
}