import { createContext, useEffect, useMemo, useRef, useState } from 'react';
import { AudioManager, Volumes } from './AudioManager';
import { ExpoAudioBackend, configureAudioMode } from './ExpoAudioBackend';
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
  const { muted: prefMuted, musicVolume, sfxVolume, setMuted: setPrefMuted } = useAudioStore();

  // Ensure registry is populated before children effects run
  if (props.preload?.length) {
    managerRef.current.preload(props.preload);
  }

  useEffect(() => {
    configureAudioMode();
  }, []);

  useEffect(() => {
    return () => { managerRef.current.dispose(); };
  }, []);

  // Sync store -> audio manager
  useEffect(() => {
    managerRef.current.setMuted(prefMuted);
    setState(managerRef.current.getState());
  }, [prefMuted]);

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
    setMuted: (m: boolean) => { setPrefMuted(m); },
    state,
  }), [state, setPrefMuted]);

  return (
    <AudioContext.Provider value={api}>
      {props.children}
    </AudioContext.Provider>
  );
}
