// Star dust particles moving horizontally across screen
import { useEffect, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import useDeltaTime from './useDeltaTime';

export type StarDust = {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  speed: number; // Individual speed multiplier for variety
};

const DUST_COUNT = 40;
const BASE_SPEED = 100; // px/sec (moves left)

function generateStarDust(count: number, width: number, height: number): StarDust[] {
  return Array.from({ length: count }, (_, index) => {
    const size = 0.3 + Math.random() * 0.8; // Tiny particles
    const speedMultiplier = 0.8 + Math.random() * 0.4; // 0.8x - 1.2x variation
    
    return {
      id: `dust-${index}`,
      x: Math.random() * width,
      y: Math.random() * height,
      size,
      color: 'rgba(247, 109, 4, 0.6)', // Subtle white dust
      opacity: 0.3 + Math.random() * 0.4, // 0.3-0.7 opacity
      speed: speedMultiplier,
    };
  });
}

function advance(dust: StarDust[], dx: number, width: number, height: number): StarDust[] {
  return dust.map((particle) => {
    let nx = particle.x + dx * particle.speed;
    
    // Wrap around: when particle exits left, respawn on right
    if (nx < -particle.size) {
      nx = width + particle.size;
    }
    // If moving right (shouldn't happen), wrap other direction
    if (nx > width + particle.size) {
      nx = -particle.size;
    }
    
    return { ...particle, x: nx };
  });
}

export const useStarDust = () => {
  const { width, height } = useWindowDimensions();
  const delta = useDeltaTime();

  const initialDust = useMemo(() => {
    return generateStarDust(DUST_COUNT, width, height);
  }, [width, height]);

  const [dust, setDust] = useState<StarDust[]>(initialDust);

  // Reinitialize when dimensions change
  useEffect(() => {
    setDust(initialDust);
  }, [initialDust]);

  // Animate dust moving left
  useEffect(() => {
    if (!delta) return; // Skip first frame
    setDust((prev) => advance(prev, -BASE_SPEED * delta, width, height));
  }, [delta, width, height]);

  return dust;
};