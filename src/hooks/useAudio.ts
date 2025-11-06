import { useContext } from 'react';
import { AudioContext } from '@/audio/AudioProvider';

export const useAudio = () => {
  const ctx = useContext(AudioContext);
  if (!ctx) {
    throw new Error('useAudio must be used within <AudioProvider>');
  }
  return ctx;
};