import { StatusBar } from 'expo-status-bar';
import { View, AppState } from 'react-native';
import { useEffect, useState } from 'react';
import { useAudio } from '@/hooks/useAudio';
import styles from '@/styles/styles';
import MainMenuScreen from '@/core/overlays/MainMenuScreen';
import GameScreen from '@/core/GameScreen';


export default function Index() {
  const { playMusic, stopMusic } = useAudio();
  const [appState, setAppState] = useState<'menu' | 'game'>('menu');
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state: 'active' | 'background' | 'inactive' | 'unknown' | 'extension') => {
      setAppState(state === 'active' ? 'game' : 'menu');
    });
    return () => {
      subscription.remove();
    };
  }, []);
  useEffect(() => {
    void playMusic('gravity_waves_soundtrack', { loop: true });
    return () => { void stopMusic(); };
  }, []);
  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}> 
      {appState === 'game' && <GameScreen />}
      {appState === 'menu' && <MainMenuScreen />}
      <StatusBar style="light" />
    </View>
  );
}