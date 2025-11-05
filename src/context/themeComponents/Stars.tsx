//Stars is a component that creates stars in the space

import { View } from 'react-native';
import { useStarsLayers } from '../../core/systems/useStars';
import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

export const Stars = () => {
    const { backgroundStars, farStars, nearStars } = useStarsLayers();
    //three shared pulsers
    const pulseA=useRef(new Animated.Value(0))
    const pulseB=useRef(new Animated.Value(0))
    const pulseC=useRef(new Animated.Value(0))

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseA.current, { toValue: 1, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseA.current, { toValue: 0, duration: 1000, useNativeDriver: true }),
            ])
        ).start();
    }, []);
    return (
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
            {backgroundStars.map((star) => (
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
            ))}
            {farStars.map((star) => (
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
            ))}
            {nearStars.map((star) => (
                <View
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
                    }}
                />
            ))}
        </View>
    );
};