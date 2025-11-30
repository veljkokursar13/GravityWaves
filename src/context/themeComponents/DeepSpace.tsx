import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../themeProvider';
import Nebula from './Nebula';
import { Stars } from './Stars';
import StarDust from './StarDust';
import NebulaShader from './NebulaShader';

export default function SpaceCreator() {
  const { colors } = useTheme();
  
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Base gradient - lowest layer */}
      <LinearGradient
        style={[StyleSheet.absoluteFill, { zIndex: -1 }]}
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
      <Nebula />
      <Stars />
      <StarDust />
    </View>
  );
}
