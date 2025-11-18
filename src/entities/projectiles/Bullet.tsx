// Bullet rendering using Skia lines (glow + core), no image
import { Group, Line } from '@shopify/react-native-skia';
import type { SpaceShipProjectile } from './types';

interface ShipBulletProps {
  bullet: SpaceShipProjectile;
}

export default function ShipBullet({ bullet }: ShipBulletProps) {
  const x1 = bullet.x;
  const y1 = bullet.y;

  // Determine bullet direction (default up)
  const angleDeg = typeof bullet.direction === 'number' ? bullet.direction : -90;
  const angleRad = (angleDeg * Math.PI) / 180;

  // Tail length derived from bullet height
  const length = Math.max(10, bullet.height);
  const dx = Math.cos(angleRad) * length;
  const dy = Math.sin(angleRad) * length;

  const x2 = x1 + dx;
  const y2 = y1 + dy;

  return (
    <Group>
      {/* Glow */}
      <Line
        p1={{ x: x1, y: y1 }}
        p2={{ x: x2, y: y2 }}
        color="rgba(0,255,255,0.5)"
        strokeWidth={6}
      />
      {/* Core */}
      <Line
        p1={{ x: x1, y: y1 }}
        p2={{ x: x2, y: y2 }}
        color="rgba(0,180,255,0.9)"
        strokeWidth={3}
      />
    </Group>
  );
}