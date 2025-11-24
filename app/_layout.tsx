import 'react-native-gesture-handler';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from '@/hooks/useFonts';
import { ThemeProvider } from '@/context/themeProvider';
import DeepSpace from '@/context/themeComponents/DeepSpace';
import { Stars } from '@/context/themeComponents/Stars';
import Nebula from '@/context/themeComponents/Nebula';
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
    // @ts-expect-error - GestureHandlerRootView types don't include children but it works at runtime
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AudioProvider
            preload={[
              { id: 'gravity_waves_soundtrack', source: require('../src/assets/audio/gravity_waves_soundtrack.mp3'), kind: 'music' },
            ]}
          >
            <DeepSpace />
            <Nebula />
            <Stars />
            <AudioControls />
            <Slot />
          </AudioProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}