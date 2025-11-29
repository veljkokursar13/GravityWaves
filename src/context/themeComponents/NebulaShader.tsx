// Nebula shader component - renders animated shader-based nebula
import { Canvas, Shader, Fill } from "@shopify/react-native-skia";
import { StyleSheet, useWindowDimensions } from "react-native";
import { useNebulaShader } from "./useNebulaShader";
import { useEffect, useState, useMemo } from "react";

interface NebulaShaderProps {
  speed?: number;       // Cloud drift speed (0.1 to 2.0)
  density?: number;     // Nebula cloud density and opacity (0.5 to 2.0)
  stars?: number;       // Star brightness and quantity (0.0 to 2.0)
  temperature?: number; // Color temperature, cool to warm (0.0 to 1.0)
  turbulence?: number;  // Cloud complexity and detail (0.5 to 2.0)
}

export default function NebulaShader({
  speed = 1.0,
  density = 1.0,
  stars = 1.0,
  temperature = 0.5,
  turbulence = 1.0,
}: NebulaShaderProps) {
  const { width, height } = useWindowDimensions();
  const shader = useNebulaShader();
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
      u_density: density,
      u_stars: stars,
      u_temperature: temperature,
      u_turbulence: turbulence,
    }),
    [width, height, time, speed, density, stars, temperature, turbulence]
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
    zIndex: 0, // Above gradient, below particle nebula
  },
});
