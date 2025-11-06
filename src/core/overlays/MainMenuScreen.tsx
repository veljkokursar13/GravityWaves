// @ts-nocheck
import { View, Text } from 'react-native';
import styles from '@/styles/styles';
import { AnimatedButton } from '@/ui/AnimatedButton';


export default function MainMenuScreen() {
  return (
    <View style={styles.mainMenuContainer}>
      <Text style={styles.mainMenuTitle}>Gravity Waves</Text>
      <Text style={styles.mainMenuDescription}>A game about gravity waves</Text>
      <AnimatedButton onPress={() => { /* TODO: navigate to game screen */ }}>Play</AnimatedButton>
    </View>
  );
}
