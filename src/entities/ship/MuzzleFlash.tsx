// Muzzle flash effect when ship fires
import { Circle } from '@shopify/react-native-skia';
import { useMemo } from 'react';

interface MuzzleFlashProps {
  x: number;
  y: number;
  time: number; // Time since flash started (0-0.03s)
}

const FLASH_DURATION = 0.03; // 30ms flash

export default function MuzzleFlash({ x, y, time }: MuzzleFlashProps) {
  const { opacity, radius } = useMemo(() => {
    if (time >= FLASH_DURATION) {
      return { opacity: 0, radius: 0 };
    }
    
    const progress = time / FLASH_DURATION;
    // Quick fade out
    const op = 1 - progress;
    // Expand slightly
    const r = 4 + progress * 2;
    
    return { opacity: op, radius: r };
  }, [time]);

  if (opacity <= 0) return null;

  return (
    <>
      {/* Outer glow */}
      <Circle
        cx={x}
        cy={y}
        r={radius * 1.5}
        color={`rgba(0, 220, 255, ${opacity * 0.4})`}
      />
      {/* Core flash */}
      <Circle
        cx={x}
        cy={y}
        r={radius}
        color={`rgba(255, 255, 255, ${opacity * 0.9})`}
      />
    </>
  );
}

