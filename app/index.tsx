import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import styles from '@/styles/styles';
import MainMenuScreen from '@/core/overlays/MainMenuScreen';

export default function Index() {
  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}> 
      <MainMenuScreen />
      <StatusBar style="light" />
    </View>
  );
}