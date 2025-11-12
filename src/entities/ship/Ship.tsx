// Ship rendering component
import React from 'react';
import { Group, Image, useImage } from '@shopify/react-native-skia';
import type { Ship as ShipType } from './types';


interface ShipProps {
  ship: ShipType;
}

export default function Ship({ ship }: ShipProps) {
    
  const shipImage = useImage(require('../../assets/images/Ship.png'));

  if (!shipImage) return null;

  return (
    <Group
      transform={[
        { translateX: ship.x },
        { translateY: ship.y },
        { rotate: ship.rotation },
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