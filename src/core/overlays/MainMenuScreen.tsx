import { View, Text } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import styles from '@/styles/styles';
import { AnimatedButton } from '@/ui/AnimatedButton';
import TypingEffect from '@/context/themeComponents/TypingEffect';


export default function MainMenuScreen() {
  const handlePlayPress = () => {
    router.push('/game');
  };
  return (
    <View style={styles.mainMenuContainer}>
      {/* Title slides down with fade */}
      <Animated.View entering={FadeInDown.duration(800).delay(200)}>
        <Text style={styles.mainMenuTitle}>Gravity Waves</Text>
      </Animated.View>
      
      {/* Description fades in with typing effect */}
      <Animated.View entering={FadeInUp.duration(600).delay(400)}>
        <TypingEffect 
          text="They are here and they come in waves" 
          style={styles.mainMenuDescription}
          speed={80}
          delay={1000}
        />
      </Animated.View>
      
      {/* Button pops in */}
      <Animated.View entering={FadeInUp.duration(600).delay(600)}>
        <AnimatedButton onPress={handlePlayPress}>Play</AnimatedButton>
      </Animated.View>
    </View>
  );
}
