import { Pressable, View, StyleSheet } from "react-native";
import { Text as RNText } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from '@/hooks/useFonts';

// Button with gradient border only; fill stays transparent until pressed
export const AnimatedButton = ({ children, onPress }: { children: React.ReactNode, onPress: () => void }) => {
  const { fontsLoaded } = useFonts();
  return (
    <View style={styles.container}>
      <LinearGradient pointerEvents="none" colors={['rgb(9,48,40)', 'rgb(35,122,87)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.topEdge} />
      <LinearGradient pointerEvents="none" colors={['rgb(9,48,40)', 'rgb(35,122,87)']} start={{ x: 1, y: 0 }} end={{ x: 0, y: 0 }} style={styles.bottomEdge} />
      <LinearGradient pointerEvents="none" colors={['rgb(9,48,40)', 'rgb(35,122,87)']} start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }} style={styles.leftEdge} />
      <LinearGradient pointerEvents="none" colors={['rgb(9,48,40)', 'rgb(35,122,87)']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.rightEdge} />

      <Pressable onPress={onPress} style={({ pressed }: { pressed: boolean }) => [styles.inner, pressed && styles.innerPressed]}>
        <RNText style={styles.text}>{children}</RNText>
      </Pressable>
    </View>
  );
}

const BORDER = 3;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 5,
    overflow: 'hidden',
    marginVertical: 12, // larger gap between elements
  },
  // edges create the gradient border while center stays transparent
  topEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: BORDER,
  },
  bottomEdge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: BORDER,
  },
  leftEdge: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: BORDER,
  },
  rightEdge: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: BORDER,
  },
  inner: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  innerPressed: {
    backgroundColor: 'rgba(162,171,88,0.15)',
  },
    text: {
        color: 'white',
      fontSize: 18,
      fontFamily: 'OrbitronBold',
    },
});