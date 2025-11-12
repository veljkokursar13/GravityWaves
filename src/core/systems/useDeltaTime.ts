//delta time hook
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

// Returns time between frames in seconds
const useDeltaTime = (): number => {
    const frameRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number | null>(null);
    const [delta, setDelta] = useState(0);
    const skipNextRef = useRef<boolean>(false);

    useEffect(() => {
        const loop = (now: number) => {
            if (lastTimeRef.current == null) {
                lastTimeRef.current = now;
                setDelta(0);
            } else {
                const dtMs = now - lastTimeRef.current;
                lastTimeRef.current = now;
                if (skipNextRef.current) {
                    skipNextRef.current = false;
                    setDelta(0);
                } else {
                    // clamp to ~33ms to avoid large jumps after resume
                    const d = Math.min(dtMs / 1000, 0.033333);
                    setDelta(d);
                }
            }
            frameRef.current = requestAnimationFrame(loop);
        };

        frameRef.current = requestAnimationFrame(loop);

        return () => {
            if (frameRef.current != null) {
                cancelAnimationFrame(frameRef.current);
            }
            lastTimeRef.current = null;
        };
    }, []);

    // Reset timing on app state changes to avoid giant deltas after resume
    useEffect(() => {
        const sub = AppState.addEventListener('change', (state: string) => {
            if (state === 'active') {
                lastTimeRef.current = null;
                skipNextRef.current = true;
            } else if (state === 'background') {
                lastTimeRef.current = null;
            }
        });
        return () => sub.remove();
    }, []);

    return delta;
};

export default useDeltaTime;