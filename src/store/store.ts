//main store for the app

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AppState = 'menu' | 'game' | 'paused' | 'gameover';

type Store = {
    score: number;
    setScore: (score: number) => void;
    addScore: (delta: number) => void;
    kills: number;
    addKills: (delta: number) => void;
    appState: AppState;
    setAppState: (state: AppState) => void;
    currentWave: number;
    setCurrentWave: (wave: number) => void;
    lives: number;
    loseLife: () => void;
    soundOn: boolean;
    toggleSound: () => void;
    booster: {
        doubleShot: boolean;
        shield: boolean;
    };
    resetGame: () => void;
}

const INITIAL_GAME_STATE = {
    score: 0,
    kills: 0,
    currentWave: 1,
    lives: 3,
    booster: {
        doubleShot: false,
        shield: false,
    },
};

export const useStore = create<Store>()(
    persist(
        (set) => ({
            ...INITIAL_GAME_STATE,
            setScore: (score: number) => set({ score }),
            addScore: (delta: number) => set((state) => ({ score: state.score + delta })),
            addKills: (delta: number) => set((state) => ({ kills: Math.max(0, state.kills + delta) })),
            appState: 'menu',
            setAppState: (state: AppState) => set({ appState: state }),
            setCurrentWave: (wave: number) => set({ currentWave: wave }),
            
            // Lives management
            loseLife: () => set((state) => ({ lives: state.lives - 1 })),
            
            // Sound toggle with AsyncStorage persistence
            soundOn: true,
            toggleSound: () =>
                set((s) => {
                    const newValue = !s.soundOn;
                    AsyncStorage.setItem('soundOn', JSON.stringify(newValue)).catch(() => {});
                    return { soundOn: newValue };
                }),
            
            // Master reset function
            resetGame: () => set({
                ...INITIAL_GAME_STATE,
                appState: 'game',
            }),
        }),
        {
            name: 'app-store',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                soundOn: state.soundOn,
                // Don't persist game state (score, wave, appState) - fresh start each session
            }),
        }
    )
);