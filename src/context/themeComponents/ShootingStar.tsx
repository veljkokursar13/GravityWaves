// Rare shooting star effect with trail
import { StyleSheet, useWindowDimensions } from 'react-native';
import { Canvas, Line, BlurMask, Paint } from '@shopify/react-native-skia';
import { useEffect, useState, memo } from 'react';

interface ShootingStarState {
  active: boolean;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  progress: number;
}

const SHOOTING_STAR_DURATION = 1200; // ms
const MIN_INTERVAL = 8000; // minimum 8s between shooting stars
const MAX_INTERVAL = 20000; // maximum 20s between shooting stars

export const ShootingStar = memo(() => {
  const { width, height } = useWindowDimensions();
  const [star, setStar] = useState<ShootingStarState>({
    active: false,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    progress: 0,
  });

  // Trigger rare shooting stars
  useEffect(() => {
    const scheduleNext = () => {
      const delay = MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);
      return setTimeout(() => {
        // Generate random diagonal trajectory
        const startX = Math.random() * width * 0.8;
        const startY = Math.random() * height * 0.3; // top third of screen
        const angle = Math.PI / 6 + Math.random() * (Math.PI / 12); // 30-45 degrees
        const length = 100 + Math.random() * 100;
        
        setStar({
          active: true,
          x1: startX,
          y1: startY,
          x2: startX + Math.cos(angle) * length,
          y2: startY + Math.sin(angle) * length,
          progress: 0,
        });
      }, delay);
    };

    let timeoutId = scheduleNext();

    return () => clearTimeout(timeoutId);
  }, [width, height]);

  // Animate shooting star with frame throttling for performance
  useEffect(() => {
    if (!star.active) return;

    const startTime = Date.now();
    let animationFrame: number;
    let lastUpdate = 0;
    const FRAME_THROTTLE = 1000 / 30; // 30fps (sufficient for shooting star)

    const animate = (timestamp: number) => {
      // Throttle updates to 30fps
      if (timestamp - lastUpdate < FRAME_THROTTLE) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }
      lastUpdate = timestamp;

      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / SHOOTING_STAR_DURATION, 1);

      setStar(prev => ({ ...prev, progress }));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setStar(prev => ({ ...prev, active: false }));
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [star.active]);

  if (!star.active || star.progress === 0) return null;

  // Fade in and out
  const opacity = star.progress < 0.2 
    ? star.progress / 0.2 
    : star.progress > 0.8 
    ? (1 - star.progress) / 0.2 
    : 1;

  return (
    <Canvas style={styles.canvas} pointerEvents="none">
      <Line
        p1={{ x: star.x1, y: star.y1 }}
        p2={{ x: star.x2, y: star.y2 }}
        strokeWidth={2}
        color={`rgba(255, 255, 255, ${opacity * 0.1})`}
      >
        <BlurMask blur={3} style="solid" />
      </Line>
      {/* Brighter core */}
      <Line
        p1={{ x: star.x1, y: star.y1 }}
        p2={{ x: star.x2, y: star.y2 }}
        strokeWidth={1}
        color={`rgba(255, 255, 255, ${opacity})`}
      />
    </Canvas>
  );
});

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
});

