// Enemy rendering component - renders any enemy type with entrance animation

import { Group, Image, useImage } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import { Enemy } from './types';

interface EnemyRendererProps {
  enemy: Enemy;
}

export default function EnemyRenderer({ enemy }: EnemyRendererProps) {
  // Use drone.png for all enemies for now
  const enemyImage = useImage(require('@/assets/images/Drone.png'));

  // Entrance animation: fade in + scale (first 0.15 seconds)
  const { opacity, scale } = useMemo(() => {
    const entranceDuration = 0.15;
    if (enemy.t < entranceDuration) {
      const progress = enemy.t / entranceDuration;
      return {
        opacity: progress, // 0 → 1
        scale: 0.8 + progress * 0.2, // 0.8 → 1.0
      };
    }
    return { opacity: 1, scale: 1 };
  }, [enemy.t]);

  if (!enemyImage) return null;

  return (
    <Group
      opacity={opacity}
      origin={{ x: enemy.x, y: enemy.y }}
      transform={[
        { translateX: enemy.x },
        { translateY: enemy.y },
        { rotate: (enemy.rotation * Math.PI) / 180 },
        { scale },
        { translateX: -enemy.width / 2 },
        { translateY: -enemy.height / 2 },
      ]}
    >
      <Image
        image={enemyImage}
        x={0}
        y={0}
        width={enemy.width}
        height={enemy.height}
      />
    </Group>
  );
}
