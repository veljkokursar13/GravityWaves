// Bullet rendering with enhanced glow and motion trail
import { BlurMask, Group, Line } from '@shopify/react-native-skia';
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

  // Tail length derived from bullet height (slightly longer for better trail)
  const length = Math.max(12, bullet.height);
  const dx = Math.cos(angleRad) * length;
  const dy = Math.sin(angleRad) * length;

  const x2 = x1 + dx;
  const y2 = y1 + dy;

  // Note: Bullet movement is handled by useBullets.ts updateBullets()
  // This component only renders - never mutate props during render

  return (
    <Group>
      {/* Outer glow with blur (AAA effect) */}
      <Line
        p1={{ x: x1, y: y1 }}
        p2={{ x: x2, y: y2 }}
        color="rgba(0,255,255,0.6)"
        strokeWidth={8}
      >
        <BlurMask blur={4} style="normal" />
      </Line>
      
      {/* Mid glow */}
      <Line
        p1={{ x: x1, y: y1 }}
        p2={{ x: x2, y: y2 }}
        color="rgba(0,220,255,0.8)"
        strokeWidth={5}
      />
      
      {/* Core (bright) */}
      <Line
        p1={{ x: x1, y: y1 }}
        p2={{ x: x2, y: y2 }}
        color="rgba(255,255,255,0.95)"
        strokeWidth={2}
      />
    </Group>
  );
}