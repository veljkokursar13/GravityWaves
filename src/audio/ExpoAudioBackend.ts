import { IAudioBackend, PlayerHandle, PlayOpts } from './AudioManager';

// Minimal expo-audio backend wrapper (expo-audio only)
// Using require to avoid TS named export mismatches across versions
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ExpoAudioMod: any = (() => { try { return require('expo-audio'); } catch { return {}; } })();
let AudioModeMod: any = ExpoAudioMod.Audio || ExpoAudioMod;

export class ExpoAudioBackend implements IAudioBackend {
  async createPlayer(source: any, opts?: PlayOpts): Promise<PlayerHandle> {
    // Prefer expo-audio's AudioPlayer if available (works on web and native)
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const ExpoAudio = require('expo-audio');
      if (ExpoAudio?.createAudioPlayer) {
        const player = ExpoAudio.createAudioPlayer(source);
        try {
          if (typeof opts?.volume === 'number') (player as any).volume = opts.volume;
          if (typeof opts?.loop === 'boolean') (player as any).loop = opts.loop;
        } catch {}
        return player as any;
      }
    } catch {
      // ignore and fall through
    }

    console.warn('[audio] expo-audio AudioPlayer not available');
    return { __noop: true } as any;
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
    try {
      if ('volume' in handle) (handle as any).volume = volume;
    } catch {}
  }

  async unload(handle: any) {
    if (handle?.__noop) return;
    if (typeof handle.remove === 'function') return handle.remove();
  }
}

// Configure audio mode for iOS silent mode and Android ducking
export async function configureAudioMode() {
  const mod: any = AudioModeMod || null;
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
}

