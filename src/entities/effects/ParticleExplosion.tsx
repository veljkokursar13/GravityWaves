// Particle explosion effect - shockwave ring only
import { Circle, Group } from '@shopify/react-native-skia';

interface ParticleExplosionProps {
  x: number;
  y: number;
  time: number; // Time since explosion started
  color?: string;
}

const EXPLOSION_DURATION = 0.5; // 500ms

export default function ParticleExplosion({ 
  x, 
  y, 
  time, 
  color = 'rgba(255, 0, 204, 1)',
}: ParticleExplosionProps) {
  if (time >= EXPLOSION_DURATION) return null;

  const progress = time / EXPLOSION_DURATION;

  return (
    <Group>
      {/* Shockwave ring */}
      <Circle
        cx={x}
        cy={y}
        r={progress * 60} // Expands to 60px
        color={color}
        opacity={(1 - progress) * 0.3} // Fades quickly
        style="stroke"
        strokeWidth={2 * (1 - progress)}
      />
    </Group>
  );
}
