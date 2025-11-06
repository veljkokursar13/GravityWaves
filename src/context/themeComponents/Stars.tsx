//Stars is a component that creates stars in the space
import { View, Animated, AppState } from 'react-native';
import { useStarsLayers } from '../../core/systems/useStars';
import { useRef, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StarsLayers } from '../../core/systems/useStars';

export const Stars = () => {
    const { backgroundStars, farStars, nearStars } = useStarsLayers();
    const pulseA = useRef(new Animated.Value(0));
    const [persisted, setPersisted] = useState<StarsLayers | null>(null);
    const STORAGE_KEY = 'stars.layers.v1';

    useEffect(() => {
        // Load last known layers (to stabilize after minimize/cold start)
        (async () => {
            try {
                const raw = await AsyncStorage.getItem(STORAGE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw) as StarsLayers;
                    setPersisted(parsed);
                }
            } catch (e) {
                console.warn('[stars] failed to load persisted layers', e);
            }
        })();
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseA.current, { toValue: 1, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseA.current, { toValue: 0, duration: 1000, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    useEffect(() => {
        // Persist on background; restore briefly on foreground to stabilize first frame
        const onChange = async (state: string) => {
            if (state === 'background') {
                try {
                    const layers: StarsLayers = {
                        backgroundStars,
                        farStars,
                        nearStars,
                    };
                    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(layers));
                } catch (e) {
                    console.warn('[stars] failed to persist layers', e);
                }
            } else if (state === 'active') {
                try {
                    const raw = await AsyncStorage.getItem(STORAGE_KEY);
                    if (raw) {
                        const parsed = JSON.parse(raw) as StarsLayers;
                        setPersisted(parsed);
                    }
                } catch (e) {
                    console.warn('[stars] failed to load layers on resume', e);
                }
            }
        };
        const sub = AppState.addEventListener('change', onChange);
        return () => sub.remove();
    }, [backgroundStars, farStars, nearStars]);

    useEffect(() => {
        // Clear persisted snapshot after one frame so animation resumes
        if (persisted) {
            const id = requestAnimationFrame(() => setPersisted(null));
            return () => cancelAnimationFrame(id);
        }
    }, [persisted]);

    const toRender = persisted ?? { backgroundStars, farStars, nearStars };

    const bgNodes = useMemo(() => toRender.backgroundStars.map(star => (
        <View
            key={star.id}
            style={{
                position: 'absolute',
                top: star.y,
                left: star.x,
                width: star.size,
                height: star.size,
                borderRadius: star.size / 2,
                opacity: 0.5,
                backgroundColor: star.color,
            }}
        />
    )), [toRender.backgroundStars]);

    const farNodes = useMemo(() => toRender.farStars.map(star => (
        <View
            key={star.id}
            style={{
                position: 'absolute',
                top: star.y,
                left: star.x,
                width: star.size,
                height: star.size,
                borderRadius: star.size / 2,
                opacity: 0.7,
                backgroundColor: star.color,
            }}
        />
    )), [toRender.farStars]);

    const nearNodes = useMemo(() => toRender.nearStars.map(star => (
        <Animated.View
            key={star.id}
            style={{
                position: 'absolute',
                top: star.y,
                left: star.x,
                width: star.size,
                height: star.size,
                borderRadius: star.size / 2,
                opacity: 1,
                backgroundColor: star.color,
                transform: [{ scale: Animated.add(1, Animated.multiply(pulseA.current, 0.1)) }],
            }}
        />
    )), [toRender.nearStars]);

    return (
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
            {bgNodes}
            {farNodes}
            {nearNodes}
        </View>
    );
};