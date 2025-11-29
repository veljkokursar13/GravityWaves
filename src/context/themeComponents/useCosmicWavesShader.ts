// Cosmic waves shader hook - creates animated cosmic waves effect
import { Skia } from "@shopify/react-native-skia";
import { useMemo } from "react";

// SKSL shader for cosmic waves with flowing colors and stars
const cosmicWavesShaderSource = `
uniform float2 u_resolution;
uniform float u_time;
uniform float u_speed;        // Wave animation speed (0.1 to 3.0)
uniform float u_amplitude;    // Wave height and intensity (0.5 to 2.0)
uniform float u_frequency;    // Wave pattern scale (0.5 to 2.0)
uniform float u_starDensity;  // Star quantity (0.0 to 2.0)
uniform float u_colorShift;   // Color cycling speed (0.1 to 3.0)

// Hash function for stars
float hash(float2 p) {
  return fract(sin(dot(p, float2(127.1, 311.7))) * 43758.5453123);
}

// Noise function for organic movement
float noise(float2 p) {
  float2 i = floor(p);
  float2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  
  float a = hash(i);
  float b = hash(i + float2(1.0, 0.0));
  float c = hash(i + float2(0.0, 1.0));
  float d = hash(i + float2(1.0, 1.0));
  
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Cosmic wave layers
float waves(float2 uv, float time) {
  float wave = 0.0;
  
  // Primary wave (horizontal flow)
  wave += sin(uv.x * u_frequency * 2.0 + time * u_speed) * u_amplitude * 0.5;
  
  // Secondary wave (diagonal)
  wave += sin((uv.x - uv.y) * u_frequency * 3.0 - time * u_speed * 0.7) * u_amplitude * 0.3;
  
  // Tertiary wave (vertical influence)
  wave += sin(uv.y * u_frequency * 1.5 + time * u_speed * 0.5) * u_amplitude * 0.4;
  
  // Add noise for organic feel
  float2 noiseUV = uv * 2.0 + float2(time * 0.1 * u_speed, time * 0.05 * u_speed);
  wave += noise(noiseUV) * u_amplitude * 0.2;
  
  // Distance from center wave
  float dist = abs(uv.y - 0.5 - wave * 0.3);
  float glow = 1.0 - smoothstep(0.0, 0.4, dist);
  
  // Add multiple glow layers for depth
  float glow2 = 1.0 - smoothstep(0.0, 0.6, dist);
  glow = glow + glow2 * 0.3;
  
  return glow;
}

// Star field generation
float stars(float2 uv) {
  if (u_starDensity <= 0.0) return 0.0;
  
  float2 starUV = uv * 60.0;
  float2 id = floor(starUV);
  float2 gv = fract(starUV) - 0.5;
  
  float n = hash(id);
  float d = length(gv);
  
  float threshold = 0.995 - (u_starDensity * 0.004);
  float star = smoothstep(0.02, 0.0, d) * step(threshold, n);
  
  // Twinkling effect
  float twinkle = sin(n * 100.0 + u_time * 2.0) * 0.5 + 0.5;
  star *= 0.5 + twinkle * 0.5;
  
  return star * u_starDensity;
}

half4 main(float2 fragCoord) {
  float2 uv = fragCoord / u_resolution.xy;
  
  // Generate cosmic waves
  float waveGlow = waves(uv, u_time);
  
  // Color cycling with hue shift
  float hue = fract(u_time * 0.1 * u_colorShift);
  
  // Color palette (deep space colors)
  float3 color1 = float3(0.15, 0.05, 0.35);  // Deep purple
  float3 color2 = float3(0.05, 0.25, 0.5);   // Deep blue
  float3 color3 = float3(0.4, 0.1, 0.3);     // Magenta
  float3 color4 = float3(0.1, 0.15, 0.4);    // Blue-purple
  
  // Cycle through colors
  float3 finalColor;
  if (hue < 0.5) {
    finalColor = mix(color1, color2, hue * 2.0);
  } else {
    finalColor = mix(color2, color3, (hue - 0.5) * 2.0);
  }
  
  // Add fourth color for variety
  float colorVar = sin(u_time * 0.3 * u_colorShift) * 0.5 + 0.5;
  finalColor = mix(finalColor, color4, colorVar * 0.3);
  
  // Apply wave glow
  finalColor *= waveGlow * 1.8;
  
  // Add stars
  float starBrightness = stars(uv);
  finalColor += float3(starBrightness * 1.2);
  
  // Vignette for depth
  float2 center = uv - 0.5;
  float vignette = 1.0 - length(center) * 0.5;
  finalColor *= vignette;
  
  // Alpha with slight transparency for layering - reduced to see nebula below
  float alpha = 0.35;
  
  return half4(half3(finalColor), half(alpha));
}
`;

export const useCosmicWavesShader = () => {
  const shader = useMemo(() => {
    try {
      const effect = Skia.RuntimeEffect.Make(cosmicWavesShaderSource);
      if (!effect) {
        console.error('[CosmicWavesShader] Failed to compile shader');
        return null;
      }
      return effect;
    } catch (error) {
      console.error('[CosmicWavesShader] Shader compilation error:', error);
      return null;
    }
  }, []);

  return shader;
};

