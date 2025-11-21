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
    paused: boolean;
    setPaused: (paused: boolean) => void;
    currentWave: number;
    setCurrentWave: (wave: number) => void;
}

export const useStore = create<Store>()(
    persist(
        (set) => ({
            score: 0,
            setScore: (score: number) => set({ score }),
            addScore: (delta: number) => set((state) => ({ score: state.score + delta })),
            kills: 0,
            addKills: (delta: number) => set((state) => ({ kills: Math.max(0, state.kills + delta) })),
            appState: 'menu',
            setAppState: (state: AppState) => set({ appState: state }),
            paused: false,
            setPaused: (paused: boolean) => set({ paused }),
            currentWave: 1,
            setCurrentWave: (wave: number) => set({ currentWave: wave }),
        }),
        {
            name: 'app-store',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                score: state.score,
                appState: state.appState,
                paused: state.paused,
                currentWave: state.currentWave,
                // kills intentionally omitted from persistence (per-run stat)
            }),
        }
    )
);