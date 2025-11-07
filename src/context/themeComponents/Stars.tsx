//Stars is a component that creates stars in the space
import { View, StyleSheet } from 'react-native';
import { useStarsLayers } from '../../core/systems/useStars';
import { memo } from 'react';
import type { Star } from '../../core/systems/useStars';

// Memoized star component to prevent unnecessary re-renders
const StarDot = memo(({ star, opacity }: { star: Star; opacity: number }) => (
    <View
        style={[
            styles.star,
            {
                top: star.y,
                left: star.x,
                width: star.size,
                height: star.size,
                borderRadius: star.size / 2,
                opacity,
                backgroundColor: star.color,
            }
        ]}
    />
));

export const Stars = memo(() => {
    const { backgroundStars, farStars, nearStars } = useStarsLayers();

    return (
        <View pointerEvents="none" style={styles.container}>
            {backgroundStars.map(star => (
                <StarDot key={star.id} star={star} opacity={0.4} />
            ))}
            {farStars.map(star => (
                <StarDot key={star.id} star={star} opacity={0.6} />
            ))}
            {nearStars.map(star => (
                <StarDot key={star.id} star={star} opacity={0.9} />
            ))}
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
    },
    star: {
        position: 'absolute',
    },
});