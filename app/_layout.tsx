import 'react-native-gesture-handler';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from '@/hooks/useFonts';
import { ThemeProvider } from '@/context/themeProvider';
import DeepSpace from '@/context/themeComponents/DeepSpace';
import { AudioProvider } from '@/audio/AudioProvider';
import { AudioControls } from '@/components/AudioControls';
import { AppStateHandler } from '@/core/statelistener/AppStateListener';

export default function RootShellLayout() {
  const { fontsLoaded, error } = useFonts();

  useEffect(() => {
    SplashScreen.preventAutoHideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (error) {
      // Silent fail - fonts will fallback to system fonts
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
              { id: 'theyarehere', source: require('../src/assets/audio/theyarehere.mp3'), kind: 'music' },
              { id: 'galacticheartbeat', source: require('../src/assets/audio/galacticheartbeat.mp3'), kind: 'music' },
            ]}
          >
            <AppStateHandler />
            <DeepSpace />
            <AudioControls />
            <Slot />
          </AudioProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}