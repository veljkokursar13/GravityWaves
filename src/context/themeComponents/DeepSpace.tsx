import { useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../themeProvider';



export type Space = {
    id: string;
    height: number;
    width: number;
    color: string;
};

export default function SpaceCreator() {
    const { width, height } = useWindowDimensions();
    const { colors } = useTheme();
    return (
      <LinearGradient
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}
        start={{ x: 0, y: 0 }} 
        end={{ x: 1, y: 1 }}
        colors={[colors.backgroundGradientStart, colors.backgroundGradientEnd]}
        pointerEvents="none"
      />
    );
  }