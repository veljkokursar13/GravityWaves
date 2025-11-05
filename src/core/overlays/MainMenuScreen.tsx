import { View, Text } from 'react-native';
import styles from '@/styles/styles';
import { Button } from '@/ui/Button';



export default function MainMenuScreen() {
  return (
    <View style={styles.mainMenuContainer}>
            <Text style={styles.mainMenuTitle}>Gravity Waves</Text>
            <Text style={styles.mainMenuDescription}>A game about gravity waves</Text>
            <Button onPress={() => {}}>Play</Button>
    </View>
  );
}
