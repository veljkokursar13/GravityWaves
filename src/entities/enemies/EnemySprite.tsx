import { Group, Image, useImage } from '@shopify/react-native-skia';
import type { Enemy } from '@/entities/enemies/types';

const enemyImageFor = (kind: Enemy['kind']) => {
  switch (kind) {
    case 'drone':
      return require('../../assets/images/Drone.png');
    case 'rogue':
      return require('../../assets/images/rogue.png');
      case 'kamikaze':
        return require('../../assets/images/Kamikaze.png');
        case 'armoredDrone':
          return require('../../assets/images/ArmoredDrone.png');
          case 'boss':
            return require('../../assets/images/Boss.png');
    default:
      return require('../../assets/images/Drone.png');
  }
};

export default function EnemySprite({ enemy }: { enemy: Enemy }) {
  const img = useImage(enemyImageFor(enemy.kind));
  if (!img) return null;

  return (
    <Group
      transform={[
        { translateX: enemy.x },
        { translateY: enemy.y },
        { translateX: -enemy.width / 2 },
        { translateY: -enemy.height / 2 },
      ]}
    >
      <Image image={img} x={0} y={0} width={enemy.width} height={enemy.height} fit="contain" />
    </Group>
  );
}