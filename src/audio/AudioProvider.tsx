import { createContext, useEffect, useMemo, useRef, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { AudioManager, IAudioBackend, Volumes } from '@/audio/AudioManager';
import { Volume2, VolumeX } from 'lucide-react-native';

export const AudioContext = createContext<{
  playMusic: (id: string, opts?: { volume?: number; loop?: boolean }) => Promise<void>;
  stopMusic: () => Promise<void>;
  playSfx: (id: string, opts?: { volume?: number }) => Promise<void>;
  setVolumes: (v: Partial<Volumes>) => Promise<void>;
  setMuted: (m: boolean) => void;
  state: { volumes: Volumes; muted: boolean };
} | null>(null);

// Minimal expo-audio backend wrapper (supports differing export shapes, with expo-av fallback)
// Using require to avoid TS named export mismatches across versions
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ExpoAudioMod: any = (() => { try { return require('expo-audio'); } catch { return {}; } })();
let SoundCtor: any = ExpoAudioMod.Sound || (ExpoAudioMod.Audio && ExpoAudioMod.Audio.Sound);
let AudioModeMod: any = ExpoAudioMod.Audio || ExpoAudioMod;
// Fallback to expo-av if expo-audio shape is not usable
if (!SoundCtor) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ExpoAv = require('expo-av');
    if (ExpoAv?.Audio?.Sound) {
      SoundCtor = ExpoAv.Audio.Sound;
      AudioModeMod = ExpoAv.Audio;
    }
  } catch {
    // noop
  }
}

export const SpeakerIcon = Volume2;
export const MutedIcon = VolumeX;

class ExpoAudioBackend implements IAudioBackend {
  async createPlayer(source: any, opts?: { volume?: number; loop?: boolean }) {
    if (!SoundCtor) {
      console.warn('[audio] expo-audio Sound class not available');
      return { __noop: true } as any;
    }
    // Some implementations use constructor+loadAsync, others expose static createAsync
    if (typeof SoundCtor.createAsync === 'function') {
      const result = await SoundCtor.createAsync(source, { volume: opts?.volume ?? 1, isLooping: !!opts?.loop });
      // Prefer result.sound if present
      return (result && (result.sound || result)) as any;
    }
    const sound = new SoundCtor();
    if (typeof sound.loadAsync === 'function') {
      await sound.loadAsync(source, { volume: opts?.volume ?? 1, isLooping: !!opts?.loop });
    }
    return sound as any;
  }
  async play(handle: any) {
    if (handle?.__noop) return;
    if (typeof handle.playAsync === 'function') return handle.playAsync();
    if (typeof handle.play === 'function') return handle.play();
  }
  async pause(handle: any) {
    if (handle?.__noop) return;
    if (typeof handle.pauseAsync === 'function') return handle.pauseAsync();
    if (typeof handle.pause === 'function') return handle.pause();
  }
  async stop(handle: any) {
    if (handle?.__noop) return;
    if (typeof handle.stopAsync === 'function') return handle.stopAsync();
    if (typeof handle.stop === 'function') return handle.stop();
  }
  async setVolume(handle: any, volume: number) {
    if (handle?.__noop) return;
    if (typeof handle.setVolumeAsync === 'function') return handle.setVolumeAsync(volume);
    if (typeof handle.setVolume === 'function') return handle.setVolume(volume);
  }
  async unload(handle: any) {
    if (handle?.__noop) return;
    if (typeof handle.unloadAsync === 'function') return handle.unloadAsync();
    if (typeof handle.unload === 'function') return handle.unload();
  }
}

type PreloadItem = { id: string; source: any; kind: 'music' | 'sfx' };

export function AudioProvider(props: { children: React.ReactNode; preload?: PreloadItem[] }) {
  const backend = useMemo(() => new ExpoAudioBackend(), []);
  const managerRef = useRef(new AudioManager(backend));
  const [state, setState] = useState(managerRef.current.getState());

  // Ensure registry is populated before children effects run
  if (props.preload?.length) {
    managerRef.current.preload(props.preload);
  }

  useEffect(() => {
    // Configure audio to play even in iOS silent mode, and duck on Android
    const mod: any = AudioModeMod || null;
    (async () => {
      try {
        if (mod?.setIsEnabledAsync) {
          await mod.setIsEnabledAsync(true);
        }
        if (mod?.setAudioModeAsync) {
          await mod.setAudioModeAsync({
            playsInSilentModeIOS: true,
            allowsRecordingIOS: false,
            staysActiveInBackground: false,
            interruptionModeIOS: 2, // duck others
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
          });
        }
      } catch (e) {
        console.warn('[audio] failed to set audio mode', e);
      }
    })();
  }, []);

  useEffect(() => {
    return () => { managerRef.current.dispose(); };
  }, []);

  const api = useMemo(() => ({
    playMusic: (id: string, opts?: { volume?: number; loop?: boolean }) => managerRef.current.playMusic(id, opts),
    stopMusic: () => managerRef.current.stopMusic(),
    playSfx: (id: string, opts?: { volume?: number }) => managerRef.current.playSfx(id, opts),
    setVolumes: async (v: Partial<Volumes>) => {
      await managerRef.current.setVolumes(v);
      setState(managerRef.current.getState());
    },
    setMuted: (m: boolean) => {
      managerRef.current.setMuted(m);
      setState(managerRef.current.getState());
    },
    state,
  }), [state]);

  return (
    <AudioContext.Provider value={api}>
      {props.children}
      <View style={styles.audioControls}>
        <Pressable onPress={() => api.setMuted(!state.muted)}>
          {state.muted ? <MutedIcon color="#ffffff" size={30} /> : <SpeakerIcon color="#ffffff" size={30} />}
        </Pressable>
      </View>
    </AudioContext.Provider>
  );
}

const styles = StyleSheet.create({
  audioControls: {
    position: 'absolute',
    top: 50,
    right: 25,
    zIndex: 10,
  },
});


