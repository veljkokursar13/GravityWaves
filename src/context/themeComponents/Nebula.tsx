// Parallax nebula background layer for depth
import { Canvas, Circle, BlurMask, Group } from '@shopify/react-native-skia';
import { useWindowDimensions } from 'react-native';
import { useEffect, useState, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import useDeltaTime from '../../core/systems/useDeltaTime';

interface NebulaCloud {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  opacity: number;
  baseOpacity: number; // Base opacity for pulsing animation
  speed: number;
  pulseSpeed: number; // Speed of opacity pulsing
  pulsePhase: number; // Phase offset for varied pulsing
}

export default function Nebula() {
  const { width, height } = useWindowDimensions();
  const delta = useDeltaTime();

  // Memoize cloud generation for performance
  const initialClouds = useMemo(() => {
    const newClouds: NebulaCloud[] = [];
    const colors = [
      'rgba(0, 100, 150, 0.3)', // Boosted alpha from 0.15 to 0.3
      'rgba(100, 50, 150, 0.25)', // Boosted from 0.12 to 0.25
      'rgba(50, 0, 100, 0.35)', // Boosted from 0.18 to 0.35
      'rgba(0, 50, 100, 0.28)', // Boosted from 0.1 to 0.28
    ];

    for (let i = 0; i < 8; i++) {
      const baseOpacity = 0.2 + Math.random() * 0.1; // More subtle: 0.15-0.25 range
      newClouds.push({
        id: `cloud-${i}`,
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 80 + Math.random() * 120,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: baseOpacity,
        baseOpacity: baseOpacity,
        speed: 5 + Math.random() * 10,
        pulseSpeed: 0.3 + Math.random() * 0.5, // Pulse cycle speed (0.3-0.8)
        pulsePhase: Math.random() * Math.PI * 2, // Random starting phase
      });
    }
    return newClouds;
  }, [width, height]);

  const [clouds, setClouds] = useState<NebulaCloud[]>(initialClouds);

  // Reinitialize when dimensions change
  useEffect(() => {
    setClouds(initialClouds);
  }, [initialClouds]);

  // Optimized parallax scrolling and pulsing animation using useDeltaTime
  useEffect(() => {
    if (!delta) return; // Skip first frame
    
    setClouds((prev) =>
      prev.map((cloud) => {
        let newY = cloud.y + cloud.speed * delta;
        // Wrap around when off screen
        if (newY > height + cloud.radius) {
          newY = -cloud.radius;
        }
        
        // Update pulse phase for breathing animation
        const newPhase = cloud.pulsePhase + cloud.pulseSpeed * delta;
        
        // Calculate pulsing opacity (±15% variation for subtle effect)
        const pulseAmount = Math.sin(newPhase) * 0.15;
        const newOpacity = cloud.baseOpacity + (cloud.baseOpacity * pulseAmount);
        
        return { 
          ...cloud, 
          y: newY,
          pulsePhase: newPhase,
          opacity: newOpacity,
        };
      })
    );
  }, [delta, height]);

  return (
    <Canvas style={styles.canvas} pointerEvents="none">
      <Group>
        {clouds.map((cloud) => (
          <Circle
            key={cloud.id}
            cx={cloud.x}
            cy={cloud.y}
            r={cloud.radius}
            color={cloud.color}
            opacity={cloud.opacity}
          >
            <BlurMask blur={40} style="normal" />
          </Circle>
        ))}
      </Group>
    </Canvas>
  );
}

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0, // Changed from -1 to 0 (stars are 1, shooting stars 2)
  },
});

