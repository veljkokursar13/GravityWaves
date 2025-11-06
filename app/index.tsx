import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useEffect } from 'react';
import { useAudio } from '@/hooks/useAudio';
import styles from '@/styles/styles';
import MainMenuScreen from '@/core/overlays/MainMenuScreen';


export default function Index() {
  const { playMusic, stopMusic } = useAudio();

  useEffect(() => {
    void playMusic('gravity_waves_soundtrack', { loop: true });
    return () => { void stopMusic(); };
  }, []);
  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}> 
      <MainMenuScreen />
      <StatusBar style="light" />
    </View>
  );
}