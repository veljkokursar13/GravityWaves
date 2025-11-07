// @ts-nocheck
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import styles from '@/styles/styles';
import { AnimatedButton } from '@/ui/AnimatedButton';


export default function MainMenuScreen() {
  const handlePlayPress = () => {
    router.push('/GameScreen');
  };
  return (
    <View style={styles.mainMenuContainer}>
      <Text style={styles.mainMenuTitle}>Gravity Waves</Text>
      <Text style={styles.mainMenuDescription}>A game about gravity waves</Text>
      <AnimatedButton onPress={handlePlayPress}>Play</AnimatedButton>
    </View>
  );
}
