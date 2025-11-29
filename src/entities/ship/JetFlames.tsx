import { Group, Path, Skia, LinearGradient, vec } from "@shopify/react-native-skia";
import { useMemo } from "react";

interface JetFlamesProps {
  x: number;           // ship center X
  y: number;           // ship center Y
  shipWidth: number;   // ship width (for offsets)
  shipHeight: number;  // ship height (for offsets)
  intensity?: number;  // 0..1
}

export default function JetFlames({ x, y, shipWidth, shipHeight, intensity = 0 }: Readonly<JetFlamesProps>) {
  if (intensity <= 0) return null;

  // Engine nozzle anchors (relative to ship center in world coords)
  const leftAnchorX = x - shipWidth * 0.11;
  const rightAnchorX = x + shipWidth * 0.11;
  const anchorY = y + shipHeight * 0.35;

  // Flame geometry
  const baseWidth = shipWidth * 0.04;
  const baseLength = shipHeight * 0.5;

  // Subtle flicker using time
  const flicker = 0.85 + 0.15 * (0.5 + 0.5 * Math.sin(Date.now() / 45));
  const length = Math.max(0, baseLength * intensity * flicker);

  // Local triangular flame path (origin at engine nozzle)
  const path = useMemo(() => {
    const p = Skia.Path.Make();
    p.moveTo(-baseWidth, 0);
    p.lineTo(0, length);
    p.lineTo(baseWidth, 0);
    p.close();
    return p;
  }, [baseWidth, length]);

  const renderFlame = (anchorX: number) => (
    <Group transform={[{ translateX: anchorX }, { translateY: anchorY }]}>
      <Path path={path} style="fill" opacity={0.95}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(0, length)}
          colors={[
            "rgba(0, 255, 255, 1)",
            "rgba(0, 255, 255, 0.45)",
            "rgba(0, 255, 255, 0.2)",
            "rgba(0, 255, 255, 0.1)",
            "transparent",
          ]}
        />
      </Path>
    </Group>
  );

  return (
    <Group>
      {renderFlame(leftAnchorX)}
      {renderFlame(rightAnchorX)}
    </Group>
  );
}

