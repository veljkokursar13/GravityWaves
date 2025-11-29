// Jet engine glow circles that render behind ship
import { Circle, Group, RadialGradient, vec } from '@shopify/react-native-skia';

interface JetEngineCirclesProps {
  x: number;           // ship center X
  y: number;           // ship center Y
  shipWidth: number;   // ship width (for offsets)
  shipHeight: number;  // ship height (for offsets)
  intensity?: number;  // 0..1
}

export default function JetEngineCircles({ 
  x, 
  y, 
  shipWidth, 
  shipHeight, 
  intensity = 0 
}: Readonly<JetEngineCirclesProps>) {
  if (intensity <= 0) return null;

  // Engine nozzle anchors (relative to ship center in world coords)
  const leftAnchorX = x - shipWidth * 0.11;
  const rightAnchorX = x + shipWidth * 0.11;
  const anchorY = y + shipHeight * 0.35;

  const renderCircle = (anchorX: number) => (
    <Circle 
      cx={anchorX} 
      cy={anchorY} 
      r={shipWidth * 0.15 * intensity} 
      opacity={intensity * 0.6}
    >
      <RadialGradient
        c={vec(anchorX, anchorY)}
        r={shipWidth * 0.15 * intensity}
        colors={["rgba(0, 255, 255, 0.8)", "rgba(0, 255, 255, 0)"]}
      />
    </Circle>
  );

  return (
    <Group>
      {renderCircle(leftAnchorX)}
      {renderCircle(rightAnchorX)}
    </Group>
  );
}