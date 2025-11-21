import { useCallback, useMemo, useState } from 'react';
import { PanResponder, View } from 'react-native';

interface JoystickProps {
    radius?: number;
    onMove: (v: { x: number; y: number }) => void;
    onRelease: () => void;
}

type GestureState = { dx: number; dy: number; [key: string]: unknown };

export default function Joystick({ radius = 60, onMove, onRelease }: Readonly<JoystickProps>) {
    const [knobOffset, setKnobOffset] = useState({ x: 0, y: 0 });

    const applyGain = useCallback((v: number) => {
        const sign = v < 0 ? -1 : 1;
        return sign * Math.pow(Math.abs(v), 0.7);
    }, []);

    const computeFromEvent = useCallback((evt: any) => {
        const { locationX, locationY } = evt.nativeEvent ?? { locationX: radius, locationY: radius };
        let dx = locationX - radius;
        let dy = locationY - radius;
        const dist = Math.hypot(dx, dy);
        if (dist > radius && dist > 0) {
            dx = (dx / dist) * radius;
            dy = (dy / dist) * radius;
        }
        // normalized vector in [-1, 1]
        let vx = dx / radius;
        let vy = dy / radius;
        // exponential gain for responsiveness
        vx = applyGain(vx);
        vy = applyGain(vy);
        return { knob: { x: dx, y: dy }, vec: { x: vx, y: vy } };
    }, [radius, applyGain]);

    const panResponder = useMemo(
        () =>
            PanResponder.create({
                onStartShouldSetPanResponder: () => true,
                onMoveShouldSetPanResponder: () => true,
                onPanResponderGrant: (evt: any) => {
                    const { knob, vec } = computeFromEvent(evt);
                    setKnobOffset(knob);
                    onMove(vec);
                },
                onPanResponderMove: (evt: any, _gestureState: GestureState) => {
                    const { knob, vec } = computeFromEvent(evt);
                    setKnobOffset(knob);
                    onMove(vec);
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
        [computeFromEvent, onMove, onRelease]
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