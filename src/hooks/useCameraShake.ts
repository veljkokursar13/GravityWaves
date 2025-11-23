import { useState, useEffect, useRef } from 'react';

/**
 * Camera shake hook for screen shake effects.
 * Returns offset values to apply to the main game container.
 */
export function useCameraShake() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const shakeIntensity = useRef(0);
  const shakeDecay = useRef(0);
  const animationFrame = useRef<number | null>(null);

  // Trigger a shake
  const shake = (intensity: number = 3, duration: number = 0.15) => {
    shakeIntensity.current = intensity;
    shakeDecay.current = intensity / (duration * 60); // Assuming 60fps
  };

  useEffect(() => {
    const animate = () => {
      if (shakeIntensity.current > 0.1) {
        // Random shake in both directions
        const x = (Math.random() - 0.5) * 2 * shakeIntensity.current;
        const y = (Math.random() - 0.5) * 2 * shakeIntensity.current;
        
        setOffset({ x, y });
        
        // Decay shake intensity
        shakeIntensity.current -= shakeDecay.current;
      } else {
        // Shake finished
        shakeIntensity.current = 0;
        setOffset({ x: 0, y: 0 });
      }
      
      animationFrame.current = requestAnimationFrame(animate);
    };

    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  return { offset, shake };
}

