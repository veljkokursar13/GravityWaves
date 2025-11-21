// Ship rendering component
import { Group, Image, useImage } from '@shopify/react-native-skia';
import type { Ship as ShipType } from './types';

interface ShipProps {
  ship: ShipType;
  velocityX?: number;
}


export default function Ship({ ship, velocityX = 0 }: Readonly<ShipProps>) {
  const shipImage = useImage(require('../../assets/images/ship.png'));

  if (!shipImage) return null;

  return (
    <Group
      transform={[
        { translateX: ship.x },
        { translateY: ship.y },
        { translateX: -ship.width / 2 },
        { translateY: -ship.height / 2 },
      ]}
    >
      <Image image={shipImage} x={0} y={0} width={ship.width} height={ship.height} fit="contain" />
    </Group>
  );
}