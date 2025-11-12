//useFonts is a hook that loads the fonts for the app
import { useFonts as useExpoFonts } from 'expo-font';


export const useFonts = () => {
  const [fontsLoaded, error] = useExpoFonts({
    // Orbitron
    Orbitron: require('../assets/fonts/Orbitron-Regular.ttf'),
    OrbitronBold: require('../assets/fonts/Orbitron-Bold.ttf'),
  
 
  //Astron valley
    AstronValley: require('../assets/fonts/Astron Valley - Regular.otf'),
    AstronValleyBold: require('../assets/fonts/Astron Valley - Bold.otf'),
    // Quantico
    Quantico: require('../assets/fonts/Quantico-Regular.ttf'),
    QuanticoBold: require('../assets/fonts/Quantico-Bold.ttf'),
    QuanticoItalic: require('../assets/fonts/Quantico-Italic.ttf'),
    QuanticoBoldItalic: require('../assets/fonts/Quantico-BoldItalic.ttf'),
  });

  return { fontsLoaded, error };
};