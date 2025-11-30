// Gravity implosion bomb effect - activates on ship collision
import { Group, Circle, RadialGradient, vec, BlurMask } from '@shopify/react-native-skia';
import type { Bomb } from '@/entities/enemies/useGravityImplosionBomb';

interface GravityImplosionBombProps {
  bomb: Bomb;
}

export default function GravityImplosionBomb({ bomb }: GravityImplosionBombProps) {
  if (!bomb.active) return null;

  if (bomb.imploding) {
    // Implosion effect - expanding then contracting ring
    const progress = bomb.implosionTimer / 1.5; // 1.5s duration
    const radius = bomb.implosionRadius;
    const opacity = Math.sin(progress * Math.PI) * 0.8; // Fade in and out

    return (
      <Group>
        {/* Outer shockwave */}
        <Circle cx={bomb.x} cy={bomb.y} r={radius * 1.2} opacity={opacity * 0.4}>
          <RadialGradient
            c={vec(bomb.x, bomb.y)}
            r={radius * 1.2}
            colors={[
              'rgba(255, 0, 255, 0)',
              'rgba(255, 0, 255, 0.6)',
              'rgba(255, 0, 255, 0)',
            ]}
          />
          <BlurMask blur={15} style="normal" />
        </Circle>

        {/* Main implosion ring */}
        <Circle cx={bomb.x} cy={bomb.y} r={radius} opacity={opacity}>
          <RadialGradient
            c={vec(bomb.x, bomb.y)}
            r={radius}
            colors={[
              'rgba(150, 0, 255, 0)',
              'rgba(200, 0, 255, 1)',
              'rgba(255, 0, 255, 0.8)',
              'rgba(150, 0, 255, 0)',
            ]}
          />
        </Circle>

        {/* Inner core */}
        <Circle cx={bomb.x} cy={bomb.y} r={radius * 0.3} opacity={opacity}>
          <RadialGradient
            c={vec(bomb.x, bomb.y)}
            r={radius * 0.3}
            colors={['rgba(255, 255, 255, 1)', 'rgba(255, 0, 255, 0.5)']}
          />
        </Circle>
      </Group>
    );
  }

  // Projectile bomb (before activation)
  const bombRadius = 12;
  const pulseScale = 1 + Math.sin(Date.now() / 100) * 0.1;

  return (
    <Group>
      {/* Outer glow */}
      <Circle
        cx={bomb.x}
        cy={bomb.y}
        r={bombRadius * pulseScale * 1.5}
        opacity={0.4}
      >
        <RadialGradient
          c={vec(bomb.x, bomb.y)}
          r={bombRadius * pulseScale * 1.5}
          colors={['rgba(255, 0, 255, 0.6)', 'rgba(255, 0, 255, 0)']}
        />
        <BlurMask blur={10} style="normal" />
      </Circle>

      {/* Core bomb */}
      <Circle cx={bomb.x} cy={bomb.y} r={bombRadius * pulseScale}>
        <RadialGradient
          c={vec(bomb.x, bomb.y)}
          r={bombRadius * pulseScale}
          colors={[
            'rgba(255, 200, 255, 1)',
            'rgba(200, 0, 255, 1)',
            'rgba(150, 0, 200, 1)',
          ]}
        />
      </Circle>

      {/* Inner highlight */}
      <Circle cx={bomb.x} cy={bomb.y} r={bombRadius * 0.4}>
        <RadialGradient
          c={vec(bomb.x, bomb.y)}
          r={bombRadius * 0.4}
          colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 200, 255, 0.3)']}
        />
      </Circle>
    </Group>
  );
}
