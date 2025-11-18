// Enemy rendering component - renders any enemy type

import { Image, useImage } from '@shopify/react-native-skia';
import { Enemy } from './types';

interface EnemyRendererProps {
  enemy: Enemy;
}

export default function EnemyRenderer({ enemy }: EnemyRendererProps) {
  // Use drone.png for all enemies for now
  const enemyImage = useImage(require('@/assets/images/Drone.png'));

  if (!enemyImage) return null;

  return (
    <Image
      image={enemyImage}
      x={enemy.x - enemy.width / 2}
      y={enemy.y - enemy.height / 2}
      width={enemy.width}
      height={enemy.height}
      origin={{ x: enemy.x, y: enemy.y }}
      transform={[{ rotate: (enemy.rotation * Math.PI) / 180 }]}
    />
  );
}
