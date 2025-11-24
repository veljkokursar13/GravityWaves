// Particle explosion effect with realistic physics and shockwave
import { Circle, Group } from '@shopify/react-native-skia';
import { useMemo } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  isDebris: boolean; // Secondary smaller particles
}

interface ParticleExplosionProps {
  x: number;
  y: number;
  time: number; // Time since explosion started
  color?: string;
  particleCount?: number;
}

const EXPLOSION_DURATION = 0.5; // 500ms

export default function ParticleExplosion({ 
  x, 
  y, 
  time, 
  color = 'rgba(255, 0, 204, 1)',
  particleCount = 32
}: ParticleExplosionProps) {
  const particles = useMemo(() => {
    const parts: Particle[] = [];
    
    // Main explosion particles (smaller, more realistic)
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      // Add angular spread variation for more natural look
      const angleVariation = (Math.random() - 0.5) * 0.3;
      const finalAngle = angle + angleVariation;
      
      // Varied speed for depth
      const speed = 100 + Math.random() * 120;
      
      parts.push({
        x: 0,
        y: 0,
        vx: Math.cos(finalAngle) * speed,
        vy: Math.sin(finalAngle) * speed,
        color: i % 3 === 0 ? color : i % 3 === 1 ? '#ffffff' : '#ffaa00',
        size: 0.3 + Math.random() * 0.7, // Smaller: 0.3-1.0px
        isDebris: false,
      });
    }
    
    // Secondary debris particles (50% size, longer duration)
    const debrisCount = Math.floor(particleCount * 0.4);
    for (let i = 0; i < debrisCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 80;
      
      parts.push({
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: '#888888',
        size: (0.3 + Math.random() * 0.7) * 0.5, // Half size
        isDebris: true,
      });
    }
    
    return parts;
  }, [particleCount, color]);

  if (time >= EXPLOSION_DURATION) return null;

  const progress = time / EXPLOSION_DURATION;
  const opacity = 1 - progress; // Fade out
  const gravity = 150; // Realistic gravity
  const drag = 0.98; // Air resistance

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
      
      {/* Particles */}
      {particles.map((particle, i) => {
        // Realistic physics: velocity decay + gravity
        const velocityDecay = Math.pow(drag, time * 60); // Frame-based decay
        const px = x + particle.vx * time * velocityDecay;
        const py = y + particle.vy * time * velocityDecay + 0.5 * gravity * time * time;
        
        // Debris lasts longer
        const particleOpacity = particle.isDebris 
          ? Math.max(0, 1 - progress * 0.7) 
          : opacity;
        
        const size = particle.size * (1 - progress * 0.3); // Slight shrink

        return (
          <Circle
            key={i}
            cx={px}
            cy={py}
            r={size}
            color={particle.color}
            opacity={particleOpacity}
          />
        );
      })}
    </Group>
  );
}
