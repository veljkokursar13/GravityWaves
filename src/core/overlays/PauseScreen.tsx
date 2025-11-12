import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useStore } from '@/store/store';
import { overlayStyles } from '@/styles/styles';
import PauseButton from '@/ui/PauseButton';


export default function PauseOverlay() {
  const appState = useStore((state) => state.appState);
  const setAppState = useStore((state) => state.setAppState);
  if (appState !== 'paused') return null;
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
    <View style={overlayStyles.overlay} pointerEvents="auto">
      {hasBlur ? (
        <BlurComponent intensity={80} tint="dark" style={StyleSheet.absoluteFillObject} />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]} />
      )}
      <View style={PauseOverlayLocalStyles.layoutContainer}>
        <Text style={PauseOverlayLocalStyles.title}>Paused</Text>
        <View style={PauseOverlayLocalStyles.buttonsResume}>
          <PauseButton isPaused={true} onPress={() => setAppState('game')} />
        </View>
      </View>
    </View>
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
  },
  buttonsRestart: {
    marginBottom: 30,
  },
  buttonsMenu: {
    marginTop: 30,
    transform: [{ scale: 0.65 }],
  },
});  