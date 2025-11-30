// Boss special attack - vertical laser beam
import { Group, Rect, LinearGradient, vec, BlurMask } from '@shopify/react-native-skia';
import type { LaserBeamState } from '@/entities/enemies/useLaserBeam';

interface LaserBeamProps {
  laserBeam: LaserBeamState;
  screenHeight: number;
}

export default function LaserBeam({ laserBeam, screenHeight }: LaserBeamProps) {
  if (!laserBeam.active) return null;

  const beamWidth = 40;
  const beamX = laserBeam.x - beamWidth / 2;

  // Calculate opacity based on phase
  let opacity = 1.0;
  if (laserBeam.charging) {
    // Pulsing effect during charge (0 to 1 second)
    const chargeProgress = laserBeam.chargeTimer;
    opacity = 0.3 + Math.sin(chargeProgress * Math.PI * 4) * 0.3; // Pulsing between 0.0-0.6
  } else if (laserBeam.firing) {
    // Full opacity when firing
    opacity = 0.9;
  }

  // Color shifts from yellow (charging) to red (firing)
  const color1 = laserBeam.charging 
    ? `rgba(255, 255, 0, ${opacity})` 
    : `rgba(255, 50, 50, ${opacity})`;
  const color2 = laserBeam.charging 
    ? `rgba(255, 200, 0, ${opacity * 0.7})` 
    : `rgba(255, 0, 0, ${opacity * 0.7})`;
  const color3 = laserBeam.charging 
    ? `rgba(255, 150, 0, ${opacity * 0.4})` 
    : `rgba(200, 0, 0, ${opacity * 0.4})`;

  return (
    <Group>
      {/* Outer glow */}
      <Rect
        x={beamX - 10}
        y={laserBeam.y}
        width={beamWidth + 20}
        height={screenHeight - laserBeam.y}
        opacity={opacity * 0.3}
      >
        <LinearGradient
          start={vec(beamX, laserBeam.y)}
          end={vec(beamX + beamWidth, laserBeam.y)}
          colors={[color3, color2, color3]}
        />
        <BlurMask blur={20} style="normal" />
      </Rect>

      {/* Core beam */}
      <Rect
        x={beamX}
        y={laserBeam.y}
        width={beamWidth}
        height={screenHeight - laserBeam.y}
        opacity={opacity}
      >
        <LinearGradient
          start={vec(beamX, laserBeam.y)}
          end={vec(beamX + beamWidth, laserBeam.y)}
          colors={[color2, color1, color2]}
        />
      </Rect>

      {/* Inner bright core */}
      {laserBeam.firing && (
        <Rect
          x={beamX + beamWidth / 4}
          y={laserBeam.y}
          width={beamWidth / 2}
          height={screenHeight - laserBeam.y}
          opacity={opacity}
        >
          <LinearGradient
            start={vec(beamX, laserBeam.y)}
            end={vec(beamX + beamWidth, laserBeam.y)}
            colors={['rgba(255, 255, 255, 1)', 'rgba(255, 200, 200, 0.8)', 'rgba(255, 255, 255, 1)']}
          />
        </Rect>
      )}
    </Group>
  );
}
