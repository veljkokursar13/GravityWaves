// Cosmic waves shader component - renders animated cosmic waves
import { Canvas, Shader, Fill } from "@shopify/react-native-skia";
import { StyleSheet, useWindowDimensions } from "react-native";
import { useCosmicWavesShader } from "./useCosmicWavesShader";
import { useEffect, useState, useMemo } from "react";

interface CosmicWavesShaderProps {
  speed?: number;       // Wave animation speed (0.1 to 3.0)
  amplitude?: number;   // Wave height and intensity (0.5 to 2.0)
  frequency?: number;   // Wave pattern scale (0.5 to 2.0)
  starDensity?: number; // Star quantity (0.0 to 2.0)
  colorShift?: number;  // Color cycling speed (0.1 to 3.0)
}

export default function CosmicWavesShader({
  speed = 1.0,
  amplitude = 1.0,
  frequency = 1.0,
  starDensity = 1.0,
  colorShift = 1.0,
}: CosmicWavesShaderProps) {
  const { width, height } = useWindowDimensions();
  const shader = useCosmicWavesShader();
  const [time, setTime] = useState(0);

  // Animate time uniform
  useEffect(() => {
    if (!shader) return;

    let rafId: number;
    const startTime = Date.now();

    const animate = () => {
      setTime((Date.now() - startTime) / 1000); // Convert to seconds
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [shader]);

  // Create uniforms for shader
  const uniforms = useMemo(
    () => ({
      u_resolution: [width, height],
      u_time: time,
      u_speed: speed,
      u_amplitude: amplitude,
      u_frequency: frequency,
      u_starDensity: starDensity,
      u_colorShift: colorShift,
    }),
    [width, height, time, speed, amplitude, frequency, starDensity, colorShift]
  );

  // Don't render if shader failed to compile
  if (!shader) {
    return null;
  }

  return (
    <Canvas style={styles.canvas} pointerEvents="none">
      <Fill>
        <Shader source={shader} uniforms={uniforms} />
      </Fill>
    </Canvas>
  );
}

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1, // Above nebula, below stars
  },
});

