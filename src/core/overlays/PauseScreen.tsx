import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useStore } from '@/store/store';
import { router } from 'expo-router';
import { overlayStyles } from '@/styles/styles';
import PauseButton from '@/ui/PauseButton';
import { AnimatedButton } from '@/ui/AnimatedButton';


export default function PauseOverlay() {
  const appState = useStore((state) => state.appState);
  const setAppState = useStore((state) => state.setAppState);
  const resetGame = useStore((state) => state.resetGame);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (appState === 'paused') {
      // Reset and trigger fade-in
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [appState, fadeAnim]);
  
  if (appState !== 'paused') return null;
  
  const handleResetGame = () => {
    // Reset all game state (score, kills, wave, lives, boosters)
    resetGame();
    router.replace('/game');
  };

  const handleBackToMenu = () => {
    setAppState('menu');
    router.replace('/');
  };
  let BlurComponent: any = View;
  let hasBlur = false;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    BlurComponent = require('expo-blur').BlurView;
    hasBlur = true;
  } catch {
    hasBlur = false;
  }
  return (
    <Animated.View style={[overlayStyles.overlay, { opacity: fadeAnim }]} pointerEvents="auto">
      {hasBlur ? (
        <BlurComponent intensity={20} tint="dark" style={StyleSheet.absoluteFillObject} />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0, 0, 0, 0.1)' }]} />
      )}
      <View style={PauseOverlayLocalStyles.layoutContainer}>
        <Text style={PauseOverlayLocalStyles.title}>Paused</Text>
        <View style={PauseOverlayLocalStyles.buttonsResume}> 
          <View style={PauseOverlayLocalStyles.playIconWrap}>
            <PauseButton size={48} isPaused={true} onPress={() => setAppState('game')} />
          </View>
          <AnimatedButton onPress={handleResetGame}>Reset Game</AnimatedButton>
          <AnimatedButton onPress={handleBackToMenu}>Back to Menu</AnimatedButton>
        </View>
      </View>
    </Animated.View>
  );
}

const PauseOverlayLocalStyles = StyleSheet.create({
  layoutContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    justifyContent: 'center',
    fontFamily: 'Orbitron',
  },
  title: {
    fontSize: 72,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'Orbitron',
    marginTop: 0,
    marginBottom: 100,
  },
  scoreCenter: {
    flexGrow: 0,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonsResume: {
    marginBottom: 20,
    alignItems: 'center',
  },
  playIconWrap: {
    marginBottom: 32,
  },
  buttonsRestart: {
    marginBottom: 30,
  },
  buttonsMenu: {
    marginTop: 30,
    transform: [{ scale: 0.65 }],
  },
});  