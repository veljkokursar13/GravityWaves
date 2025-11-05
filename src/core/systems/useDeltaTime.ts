//delta time hook
import { useEffect, useRef, useState } from 'react';

// Returns time between frames in seconds
const useDeltaTime = (): number => {
    const frameRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number | null>(null);
    const [delta, setDelta] = useState(0);

    useEffect(() => {
        const loop = (now: number) => {
            if (lastTimeRef.current == null) {
                lastTimeRef.current = now;
                setDelta(0);
            } else {
                const dtMs = now - lastTimeRef.current;
                lastTimeRef.current = now;
                setDelta(dtMs / 1000);
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

    return delta;
};

export default useDeltaTime;