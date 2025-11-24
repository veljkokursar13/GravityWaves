import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../themeProvider';
import Nebula from './Nebula';
import { Stars } from './Stars';
import { ShootingStar } from './ShootingStar';

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
      <Nebula />
      <Stars />
      <ShootingStar />
    </View>
  );
}