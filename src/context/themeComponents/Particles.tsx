//Particles are moving from right to left.
//Particles are small and have opacity 0.1 or 0.2.
//Particles are moving at a random speed between 10 and 100 pixels per second.
import { useEffect, useRef } from "react";
import { Canvas, Circle, Group } from "@shopify/react-native-skia";
import { StyleSheet } from "react-native";
import { useWindowDimensions } from "react-native";
import { useTheme } from "../themeProvider";
export default function Particles() {
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const { colors } = useTheme();
    const particles = useRef<{ x: number; y: number; size: number; opacity: number; speed: number; direction: number; color: string }[]>([]);
    useEffect(() => {
        const interval = setInterval(() => {
            particles.current.push({
                x: Math.random() * screenWidth,
                y: Math.random() * screenHeight,
                size: Math.random() * 5,
                opacity: Math.random() * 0.1 + 0.1,
                speed: Math.random() * 100 + 100,
                direction: Math.random() * 2 * Math.PI,
                color: colors.text,
            });
            if (particles.current.length > 100) {
                particles.current.shift();
            }
        }, 100);
        return () => clearInterval(interval);
    }, [colors.text, screenWidth, screenHeight]);
    return (
        <Canvas style={styles.canvas} pointerEvents="none">
            <Group>
                {particles.current.map((particle: { x: number; y: number; size: number; opacity: number; speed: number; direction: number; color: string }, index: number) => (
                    <Circle key={index} cx={particle.x} cy={particle.y} r={particle.size} color={particle.color} opacity={particle.opacity} />
                ))}
            </Group>
        </Canvas>
    );
}

const styles = StyleSheet.create({
    canvas: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
    },
});