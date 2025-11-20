import { useCallback, useMemo, useState } from 'react';

type JoystickVector = { x: number; y: number };

export function useJoystick() {
    const [joystickVector, setJoystickVector] = useState<JoystickVector>({ x: 0, y: 0 });

    const onMove = useCallback((dx: number, dy: number) => {
        const magnitude = Math.hypot(dx, dy);

        if (magnitude <= 0.001) {
            setJoystickVector({ x: 0, y: 0 });
            return;
        }

        const normalizedX = dx / magnitude;
        const normalizedY = dy / magnitude;

        setJoystickVector({ x: normalizedX, y: normalizedY });
    }, []);

    const onRelease = useCallback(() => {
        setJoystickVector({ x: 0, y: 0 });
    }, []);

    return useMemo(
        () => ({
            vector: joystickVector,
            onMove,
            onRelease,
        }),
        [joystickVector, onMove, onRelease]
    );
}