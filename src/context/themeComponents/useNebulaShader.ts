// Nebula shader hook - creates animated space nebula effect
import { Skia } from "@shopify/react-native-skia";
import { useMemo } from "react";

// SKSL shader for animated nebula effect with customizable parameters
const nebulaShaderSource = `
uniform float2 u_resolution;
uniform float u_time;
uniform float u_speed;        // Cloud drift speed (0.1 to 2.0)
uniform float u_density;      // Nebula cloud density and opacity (0.5 to 2.0)
uniform float u_stars;        // Star brightness and quantity (0.0 to 2.0)
uniform float u_temperature;  // Color temperature, cool to warm (0.0 to 1.0)
uniform float u_turbulence;   // Cloud complexity and detail (0.5 to 2.0)

// Simple noise function
float hash(float2 p) {
  return fract(sin(dot(p, float2(127.1, 311.7))) * 43758.5453123);
}

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

// Fractal Brownian Motion with turbulence control
float fbm(float2 p, float turbulence) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = turbulence;
  
  // More iterations for higher turbulence
  int iterations = int(3.0 + turbulence * 2.0);
  
  for (int i = 0; i < 6; i++) {
    if (i >= iterations) break;
    value += amplitude * noise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  
  return value;
}

// Star field generation
float stars(float2 uv, float brightness) {
  if (brightness <= 0.0) return 0.0;
  
  float2 starUV = uv * 80.0;
  float2 gv = fract(starUV) - 0.5;
  float2 id = floor(starUV);
  
  float n = hash(id);
  float d = length(gv);
  
  float threshold = 0.995 - (brightness * 0.004);
  float star = smoothstep(0.02, 0.0, d) * step(threshold, n);
  
  return star * brightness;
}

half4 main(float2 fragCoord) {
  // Normalize coordinates
  float2 uv = fragCoord / u_resolution.xy;
  
  // Create flowing nebula effect with speed control
  float2 p = uv * (2.0 + u_density * 0.5);
  p.x += u_time * 0.05 * u_speed;
  p.y += u_time * 0.03 * u_speed;
  
  // Multiple layers of noise with turbulence
  float n1 = fbm(p, u_turbulence);
  float n2 = fbm(p + float2(1.7, 4.8) + u_time * 0.1 * u_speed, u_turbulence);
  float n3 = fbm(p - float2(2.3, 1.2) + u_time * 0.08 * u_speed, u_turbulence);
  
  // Combine noise layers with density
  float noise_val = (n1 + n2 + n3) / 3.0;
  noise_val = pow(noise_val, 1.0 / u_density); // Density control
  
  // Color temperature blending (cool to warm)
  float3 coolColor1 = float3(0.05, 0.05, 0.15);  // Deep blue
  float3 coolColor2 = float3(0.1, 0.05, 0.25);   // Cool purple
  float3 coolColor3 = float3(0.05, 0.15, 0.35);  // Blue
  
  float3 warmColor1 = float3(0.15, 0.05, 0.1);   // Deep magenta
  float3 warmColor2 = float3(0.25, 0.1, 0.2);    // Warm purple
  float3 warmColor3 = float3(0.3, 0.15, 0.1);    // Orange-red
  
  // Interpolate between cool and warm palettes
  float3 color1 = mix(coolColor1, warmColor1, u_temperature);
  float3 color2 = mix(coolColor2, warmColor2, u_temperature);
  float3 color3 = mix(coolColor3, warmColor3, u_temperature);
  
  // Mix colors based on noise
  float3 finalColor = mix(color1, color2, noise_val);
  finalColor = mix(finalColor, color3, n2 * 0.5);
  
  // Add brightness variation with density
  float brightness = (0.2 + noise_val * 0.5) * u_density;
  finalColor *= brightness;
  
  // Add stars
  float starBrightness = stars(uv, u_stars);
  finalColor += float3(starBrightness);
  
  // Vignette effect (darker at edges)
  float2 center = uv - 0.5;
  float vignette = 1.0 - length(center) * 0.6;
  finalColor *= vignette;
  
  // Alpha with density control - increased visibility
  float alpha = 0.6 + (u_density * 0.2);
  
  return half4(half3(finalColor), half(alpha));
}
`;

export const useNebulaShader = () => {
  const shader = useMemo(() => {
    try {
      const effect = Skia.RuntimeEffect.Make(nebulaShaderSource);
      if (!effect) {
        console.error('[NebulaShader] Failed to compile shader');
        return null;
      }
      return effect;
    } catch (error) {
      console.error('[NebulaShader] Shader compilation error:', error);
      return null;
    }
  }, []);

  return shader;
};
