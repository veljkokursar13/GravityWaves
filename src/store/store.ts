//main store for the app

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AppState = 'menu' | 'game' | 'paused' | 'gameover';

type Store = {
    score: number;
    setScore: (score: number) => void;
    appState: AppState;
    setAppState: (state: AppState) => void;
    paused: boolean;
    setPaused: (paused: boolean) => void;
}

export const useStore = create<Store>()(
    persist(
        (set) => ({
            score: 0,
            setScore: (score: number) => set({ score }),
            appState: 'menu',
            setAppState: (state: AppState) => set({ appState: state }),
            paused: false,
            setPaused: (paused: boolean) => set({ paused }),
        }),
        {
            name: 'app-store',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                score: state.score,
                appState: state.appState,
                paused: state.paused,
            }),
        }
    )
);