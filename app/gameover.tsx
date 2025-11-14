import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useStore } from '@/store/store';
import { useEffect } from 'react';

export default function GameOver() {
  const { score, setAppState } = useStore();

  useEffect(() => {
    // Reset to game over state when screen mounts
    setAppState('gameover');
  }, [setAppState]);

  const handleRestart = () => {
    setAppState('game');
    router.replace('/game');
  };

  const handleMainMenu = () => {
    setAppState('menu');
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Game Over</Text>
        <Text style={styles.score}>Score: {score}</Text>
        
        <View style={styles.buttonContainer}>
          <Pressable style={styles.button} onPress={handleRestart}>
            <Text style={styles.buttonText}>Play Again</Text>
          </Pressable>
          
          <Pressable style={[styles.button, styles.secondaryButton]} onPress={handleMainMenu}>
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Main Menu</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ff4444',
    marginBottom: 20,
    textShadowColor: 'rgba(255, 68, 68, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  score: {
    fontSize: 32,
    color: '#fff',
    marginBottom: 40,
  },
  buttonContainer: {
    gap: 16,
    width: 250,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#fff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#fff',
  },
});

