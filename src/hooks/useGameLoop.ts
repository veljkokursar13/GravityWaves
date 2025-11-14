import { useEffect, useRef } from 'react';
import useDeltaTime from '@/core/systems/useDeltaTime';

interface GameLoopCallback {
    (delta: number): void;
}

export function useGameLoop(callback: GameLoopCallback, paused: boolean = false) {
    const delta = useDeltaTime();
    const callbackRef = useRef(callback);
    
    // Keep callback ref fresh
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);
    
    useEffect(() => {
        if (!paused && delta > 0) {
            callbackRef.current(delta);
        }
    }, [delta, paused]);
}

