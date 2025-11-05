//useAudio is a hook that manages audio playback
import { useEffect, useRef, useState } from 'react';

export const useAudio = (audio: Audio) => {
    const audioRef = useRef<Audio | null>(null);
    useEffect(() => {
        audioRef.current = audio;
    }, [audio]);
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.play();
            audioRef.current.isPlaying = true;
        }
    }, [audioRef.current]);
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.isPaused = true;
        }
    }, [audioRef.current]);
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.stop();
            audioRef.current.isStopped = true;
        }
    }, [audioRef.current]);
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.isCompleted = true;
        }
    }, [audioRef.current]);
    return audioRef.current;
};