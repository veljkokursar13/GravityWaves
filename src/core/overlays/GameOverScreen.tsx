//GameOverScreen is an overlay component that displays the game over screen

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useStore } from '@/store/store';
import { router } from 'expo-router';
import { overlayStyles } from '@/styles/styles';
import { BackToMenuButton } from '@/ui/BackToMenuButton';
import { ResetGameButton } from '@/ui/ResetGameButton';

export default function GameOverScreen() {
  const appState = useStore((state) => state.appState);
  const { score, setAppState, setScore } = useStore();

  if (appState !== 'gameover') return null;

  let BlurComponent: any = View;
  let hasBlur = false;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    BlurComponent = require('expo-blur').BlurView;
    hasBlur = true;
  } catch {
    hasBlur = false;
  }

  const handleResetGame = () => {
    // Navigate to game route (this will trigger GameEngine reset)
    router.replace('/game');
  };

  const handleMainMenu = () => {
    // Reset score when going to menu
    setScore(0);
    setAppState('menu');
    router.replace('/');
  };

  return (
    <View style={overlayStyles.overlay} pointerEvents="auto">
      {hasBlur ? (
        <BlurComponent intensity={80} tint="dark" style={StyleSheet.absoluteFillObject} />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0, 0, 0, 0.95)' }]} />
      )}
      <View style={GameOverLocalStyles.layoutContainer}>
        <Text style={GameOverLocalStyles.title}>Game Over</Text>
        <View style={GameOverLocalStyles.scoreCenter}>
          <Text style={GameOverLocalStyles.score}>Score: {score}</Text>
        </View>
        <View style={GameOverLocalStyles.buttonsContainer}>
          <View style={GameOverLocalStyles.buttonsRestart}>
            <ResetGameButton onPress={handleResetGame} />
          </View>
          <View style={GameOverLocalStyles.buttonsMenu}>
            <BackToMenuButton onPress={handleMainMenu}>
              Main Menu
            </BackToMenuButton>
          </View>
        </View>
      </View>
    </View>
  );
}

const GameOverLocalStyles = StyleSheet.create({
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
    marginBottom: 40,
  },
  scoreCenter: {
    flexGrow: 0,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
  },
  score: {
    fontSize: 36,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'Orbitron',
  },
  buttonsContainer: {
    alignItems: 'center',
    width: '100%',
  },
  buttonsRestart: {
    marginBottom: 20,
  },
  buttonsMenu: {
    marginTop: 10,
  },
});

