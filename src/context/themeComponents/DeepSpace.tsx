import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../themeProvider';
import Nebula from './Nebula';
import { Stars } from './Stars';
import StarDust from './StarDust';
import NebulaShader from './NebulaShader';
import CosmicWavesShader from './CosmicWavesShader';

export default function SpaceCreator() {
  const { colors } = useTheme();
  
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Base gradient */}
      <LinearGradient
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        colors={[colors.backgroundGradientStart, colors.backgroundGradientEnd]}
      />
      
      {/* Layered space elements - back to front */}
      <NebulaShader 
        speed={0.8}          // Cloud drift speed
        density={1.2}        // Nebula cloud density
        stars={1.5}          // Star brightness
        temperature={0.4}    // Cool temperature (blue/purple)
        turbulence={1.3}     // Cloud complexity
      />
      <CosmicWavesShader 
        speed={1.0}          // Wave flow animation speed
        amplitude={1.2}      // Wave height and intensity
        frequency={0.8}      // Wave density and pattern scale
        starDensity={1.0}    // Star quantity and brightness
        colorShift={1.0}     // Color cycling speed
      />
      <Nebula />
      <Stars />
      <StarDust />
    </View>
  );
}
