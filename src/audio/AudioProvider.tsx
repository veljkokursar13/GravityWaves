import { createContext, useEffect, useMemo, useRef, useState } from 'react';
import { AudioManager, Volumes } from './AudioManager';
import { ExpoAudioBackend, configureAudioMode } from './ExpoAudioBackend';
import { useStore } from '@/store/store';
import { useAudioStore } from '@/store/audio';

export const AudioContext = createContext<{
  playMusic: (id: string, opts?: { volume?: number; loop?: boolean }) => Promise<void>;
  stopMusic: () => Promise<void>;
  playSfx: (id: string, opts?: { volume?: number }) => Promise<void>;
  setVolumes: (v: Partial<Volumes>) => Promise<void>;
  setMuted: (m: boolean) => void;
  state: { volumes: Volumes; muted: boolean };
} | null>(null);

type PreloadItem = { id: string; source: any; kind: 'music' | 'sfx' };

export function AudioProvider(props: { children: React.ReactNode; preload?: PreloadItem[] }) {
  const backend = useMemo(() => new ExpoAudioBackend(), []);
  const managerRef = useRef(new AudioManager(backend));
  const [state, setState] = useState(managerRef.current.getState());
  
  // Use main store for master mute toggle (soundOn)
  const soundOn = useStore((state) => state.soundOn);
  const toggleSound = useStore((state) => state.toggleSound);
  
  // Use audio store for detailed volume controls
  const { musicVolume, sfxVolume } = useAudioStore();
  
  // Convert soundOn (true = unmuted) to muted (true = muted)
  const muted = !soundOn;

  // Ensure registry is populated before children effects run
  if (props.preload?.length) {
    managerRef.current.preload(props.preload);
  }

  useEffect(() => {
    configureAudioMode();
    
    // Auto-play music when provider mounts
    const autoPlayMusic = async () => {
      try {
        // Wait a bit for audio system to be ready
        await new Promise(resolve => setTimeout(resolve, 500));
        await managerRef.current.playMusic('theyarehere', { loop: true, volume: 0.7 });
      } catch (error) {
        console.warn('[AudioProvider] Auto-play failed:', error);
      }
    };
    
    autoPlayMusic();
  }, []);

  useEffect(() => {
    return () => { managerRef.current.dispose(); };
  }, []);

  // Sync main store soundOn -> audio manager muted
  useEffect(() => {
    managerRef.current.setMuted(muted);
    setState(managerRef.current.getState());
  }, [muted]);

  useEffect(() => {
    managerRef.current.setVolumes({ music: musicVolume, sfx: sfxVolume });
    setState(managerRef.current.getState());
  }, [musicVolume, sfxVolume]);

  const api = useMemo(() => ({
    playMusic: (id: string, opts?: { volume?: number; loop?: boolean }) => managerRef.current.playMusic(id, opts),
    stopMusic: () => managerRef.current.stopMusic(),
    playSfx: (id: string, opts?: { volume?: number }) => managerRef.current.playSfx(id, opts),
    setVolumes: async (v: Partial<Volumes>) => {
      await managerRef.current.setVolumes(v);
      setState(managerRef.current.getState());
    },
    setMuted: (m: boolean) => { 
      // m = true means mute, so soundOn should be false
      // Call toggleSound only if current state doesn't match desired state
      if (soundOn === m) {
        toggleSound();
      }
    },
    state,
  }), [state, soundOn, toggleSound]);

  return (
    <AudioContext.Provider value={api}>
      {props.children}
    </AudioContext.Provider>
  );
}
