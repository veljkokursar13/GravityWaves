// Ship rendering component
import { Group, Image, useImage } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import type { Ship as ShipType } from './types';

interface ShipProps {
  ship: ShipType;
  velocityX: number;
}

const MAX_LEAN = 0.32;

export default function Ship({ ship, velocityX }: Readonly<ShipProps>) {
  const shipImage = useImage(require('../../assets/images/ship.png'));

  const lean = useMemo(() => {
    
    const normalized = Math.max(-1, Math.min(1, velocityX/ 400));
    return normalized * MAX_LEAN;
  }, [velocityX]);

  if (!shipImage) return null;

  return (
    <Group
      transform={[
        { translateX: ship.x },
        { translateY: ship.y },
        { skewX: lean },
        { skewY: 0 }, 
      ]}
    >
      <Image image={shipImage} x={0} y={0} width={ship.width} height={ship.height} fit="contain" />
    </Group>
  );
}