import { useCallback, useMemo, useState } from 'react';

type Vector = { x: number; y: number };

export default function useJoystick() {
    const [vector, setVector] = useState<Vector>({ x: 0, y: 0 });

    const onMove = useCallback((raw: Vector) => {
        let vx = raw.x;
        let vy = raw.y;
        const mag = Math.hypot(vx, vy);

        // Small deadzone to prevent jitter at rest
        if (mag < 0.05) {
            setVector({ x: 0, y: 0 });
            return;
        }

        // If magnitude > 1, clamp to unit circle; otherwise preserve shape (e.g., exponential gain)
        if (mag > 1e-6 && mag > 1) {
            vx /= mag;
            vy /= mag;
        }
        setVector({ x: vx, y: vy });
    }, []);

    const onRelease = useCallback(() => {
        setVector({ x: 0, y: 0 });
    }, []);

    return useMemo(
        () => ({
            vector,
            onMove,
            onRelease,
        }),
        [vector, onMove, onRelease]
    );
}