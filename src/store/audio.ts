import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AudioState = {
  muted: boolean;
  musicVolume: number;
  sfxVolume: number;
  setMuted: (m: boolean) => void;
  setMusicVolume: (v: number) => void;
  setSfxVolume: (v: number) => void;
};

export const useAudioStore = create<AudioState>()(
  persist(
    (set) => ({
      muted: false,
      musicVolume: 0.8,
      sfxVolume: 1.0,
      setMuted: (muted) => set({ muted }),
      setMusicVolume: (musicVolume) => set({ musicVolume }),
      setSfxVolume: (sfxVolume) => set({ sfxVolume }),
    }),
    { name: 'audio-prefs', storage: createJSONStorage(() => AsyncStorage) }
  )
);


