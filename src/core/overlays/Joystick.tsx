import { useCallback, useMemo, useState } from 'react';
import { PanResponder, View } from 'react-native';

interface JoystickProps {
    radius?: number;
    onMove: (dx: number, dy: number) => void;
    onRelease: () => void;
}

type GestureState = { dx: number; dy: number; [key: string]: unknown };

export default function Joystick({ radius = 60, onMove, onRelease }: Readonly<JoystickProps>) {
    const [knobOffset, setKnobOffset] = useState({ x: 0, y: 0 });

    const clampOffset = useCallback(
        ({ dx, dy }: GestureState) => {
            const distance = Math.hypot(dx, dy);

            if (distance <= radius) {
                return { x: dx, y: dy };
            }

            if (distance === 0) {
                return { x: 0, y: 0 };
            }

            const scale = radius / distance;
            return { x: dx * scale, y: dy * scale };
        },
        [radius]
    );

    const panResponder = useMemo(
        () =>
            PanResponder.create({
                onStartShouldSetPanResponder: () => true,
                onMoveShouldSetPanResponder: () => true,
                onPanResponderGrant: () => {
                    setKnobOffset({ x: 0, y: 0 });
                    onMove(0, 0);
                },
                onPanResponderMove: (_evt: unknown, gestureState: GestureState) => {
                    const next = clampOffset(gestureState);
                    setKnobOffset(next);
                    onMove(next.x, next.y);
                },
                onPanResponderRelease: () => {
                    setKnobOffset({ x: 0, y: 0 });
                    onRelease();
                },
                onPanResponderTerminate: () => {
                    setKnobOffset({ x: 0, y: 0 });
                    onRelease();
                },
            }),
        [clampOffset, onMove, onRelease]
    );

    const containerStyle = useMemo(
        () => ({
            position: 'absolute' as const,
            bottom: 20,
            left: 20,
            width: radius * 2,
            height: radius * 2,
            borderRadius: radius,
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            justifyContent: 'center' as const,
            alignItems: 'center' as const,
        }),
        [radius]
    );

    const knobMetrics = useMemo(() => {
        const knobRadius = radius / 3;
        const diameter = knobRadius * 2;
        return { knobRadius, diameter };
    }, [radius]);

    const knobStyle = useMemo(
        () => ({
            width: knobMetrics.diameter,
            height: knobMetrics.diameter,
            borderRadius: knobMetrics.knobRadius,
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
        }),
        [knobMetrics]
    );

    return (
        <View style={containerStyle} {...panResponder.panHandlers}>
            <View
                style={{
                    ...knobStyle,
                    transform: [
                        { translateX: knobOffset.x - knobMetrics.knobRadius },
                        { translateY: knobOffset.y - knobMetrics.knobRadius },
                    ],
                }}
            />
        </View>
    );
}