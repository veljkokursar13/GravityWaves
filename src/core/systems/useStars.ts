import { useEffect, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useTheme } from '../../context/themeProvider';
import useDeltaTime from './useDeltaTime';

export type Star = {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
};

export type StarsLayers = {
  nearStars: Star[];
  farStars: Star[];
  backgroundStars: Star[];
};

const NEAR_COUNT = 15;
const FAR_COUNT = 40;
const BACKGROUND_COUNT = 80;

const NEAR_SPEED = 60; // px/sec
const FAR_SPEED = 30;  // px/sec
const BACKGROUND_SPEED = 10; // px/sec

function generateStars(count: number, width: number, height: number, color: string, sizeMin: number, sizeMax: number, prefix: string): Star[] {
  return Array.from({ length: count }, (_, index) => {
    const size = sizeMin + Math.random() * (sizeMax - sizeMin);
    return {
      id: `${prefix}-${index}`,
      x: Math.random() * width,
      y: Math.random() * height,
      size,
      color,
    };
  });
}

function advance(stars: Star[], dx: number, dy: number, width: number, height: number): Star[] {
  return stars.map((star) => {
    let nx = star.x + dx;
    let ny = star.y + dy;
    // wrap horizontally
    if (nx < -star.size) nx = width + star.size;
    if (nx > width + star.size) nx = -star.size;
    // wrap vertically (if ever used)
    if (ny < -star.size) ny = height + star.size;
    if (ny > height + star.size) ny = -star.size;
    return { ...star, x: nx, y: ny };
  });
}

export const useStarsLayers = (): StarsLayers => {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const delta = useDeltaTime();

  const initial = useMemo(() => {
    return {
      near: generateStars(NEAR_COUNT, width, height, colors.text, 1.2, 2.2, 'near'),
      far: generateStars(FAR_COUNT, width, height, colors.text, 1.0, 2.0, 'far'),
      background: generateStars(BACKGROUND_COUNT, width, height, colors.text, 0.8, 1.8, 'bg'),
    };
  }, [colors.text, width, height]);

  const [nearStars, setNearStars] = useState<Star[]>(initial.near);
  const [farStars, setFarStars] = useState<Star[]>(initial.far);
  const [backgroundStars, setBackgroundStars] = useState<Star[]>(initial.background);

  useEffect(() => {
    // reinitialize when viewport or theme changes
    setNearStars(initial.near);
    setFarStars(initial.far);
    setBackgroundStars(initial.background);
  }, [initial]);

  useEffect(() => {
    if (!delta) return; // skip first frame
    setNearStars((prev) => advance(prev, 0, NEAR_SPEED * delta, width, height));
    setFarStars((prev) => advance(prev, 0, FAR_SPEED * delta, width, height));
    setBackgroundStars((prev) => advance(prev, 0, BACKGROUND_SPEED * delta, width, height));
  }, [delta, width, height]);

  return { nearStars, farStars, backgroundStars };
};
