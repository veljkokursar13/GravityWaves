import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from '@/hooks/useFonts';
import { ThemeProvider } from '@/context/themeProvider';
import DeepSpace from '@/context/themeComponents/DeepSpace';
import { Stars } from '@/context/themeComponents/Stars';
import { AudioProvider } from '@/audio/AudioProvider';
import { AudioControls } from '@/components/AudioControls';

export default function RootShellLayout() {
  const { fontsLoaded, error } = useFonts();

  useEffect(() => {
    SplashScreen.preventAutoHideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (error) {
      console.warn('[fonts] failed to load fonts', error);
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [error]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AudioProvider
          preload={[
            { id: 'gravity_waves_soundtrack', source: require('../src/assets/audio/gravity_waves_soundtrack.mp3'), kind: 'music' },
          ]}
        >
          <DeepSpace />
          <Stars />
          <AudioControls />
          <Slot />
        </AudioProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}