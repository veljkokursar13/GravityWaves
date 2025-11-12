import { useWindowDimensions, StyleSheet, View, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../themeProvider';

export default function SpaceCreator() {
    const { width, height } = useWindowDimensions();
    const { colors } = useTheme();
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          colors={[colors.backgroundGradientStart, colors.backgroundGradientEnd]}
        />
      </View>
    );
}