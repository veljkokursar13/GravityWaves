import { Canvas, Group } from "@shopify/react-native-skia";
import { View, useWindowDimensions } from "react-native";
import { useCallback, useState, useRef } from "react";
import Ship from "@/entities/ship/Ship";
import Drone from "@/entities/enemies/Drone";
import { initialShip, type Ship as ShipType } from "@/entities/ship/types";
import { useDrones } from "@/entities/enemies/DroneSpawn";
import { useGameLoop } from "@/hooks/useGameLoop";
import { detectCollisions } from "@/core/systems/collision";
import { useStore } from "@/store/store";
import { router } from "expo-router";

export default function GameEngine() {
    const { width, height } = useWindowDimensions();
    const { appState, setAppState } = useStore();
    const paused = appState === 'paused';
    
    const [ship, setShip] = useState<ShipType>({ 
        ...initialShip, 
        x: width / 2, 
        y: height - 50 
    });

    const { drones, updateDrones } = useDrones();
    const previousShipX = useRef<number>(width / 2);
    const velocityX = useRef<number>(0);
    const targetPos = useRef({ x: width / 2, y: height - 50 });
    const gameOverTriggered = useRef<boolean>(false);

    // Smooth lerp interpolation
    const lerp = (start: number, end: number, factor: number) => {
        return start + (end - start) * factor;
    };

    // Centralized game loop
    useGameLoop((delta) => {
        // Smooth ship movement towards target
        const lerpFactor = Math.min(1, delta * 12); // Smooth follow speed
        const newX = lerp(ship.x, targetPos.current.x, lerpFactor);
        const newY = lerp(ship.y, targetPos.current.y, lerpFactor);
        
        // Calculate velocity for ship banking
        const dx = newX - previousShipX.current;
        velocityX.current = dx / delta;
        previousShipX.current = newX;

        // Update ship position
        setShip(prev => ({ ...prev, x: newX, y: newY }));

        // Update drones
        updateDrones(delta, newX, newY);
        
        // Check collisions
        const collisions = detectCollisions(ship, drones);
        if (collisions.length > 0 && !gameOverTriggered.current) {
            gameOverTriggered.current = true;
            setAppState('gameover');
            router.push('/gameover');
        }
    }, paused);

    const handleTouch = useCallback((event: any) => {
        const { locationX, locationY } = event.nativeEvent;
        const offsetX = ship.width * 0.5;
        const offsetY = ship.height * 0.7;
        
        const targetX = Math.max(
            ship.width / 2,
            Math.min(width - ship.width / 2, locationX - offsetX)
        );
        const targetY = Math.max(
            ship.height / 2,
            Math.min(height - ship.height / 2, locationY - offsetY)
        );

        // Update target position for smooth interpolation
        targetPos.current = { x: targetX, y: targetY };
    }, [height, ship.height, ship.width, width]);

    const handleTouchEnd = useCallback(() => {
        // Optionally stop animation or continue to target
    }, []);

    return(
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
            <Canvas style={{ flex: 1, backgroundColor: 'transparent' }}>
                <Group>
                    {/* Render drones */}
                    {drones.map(drone => (
                        <Drone key={drone.id} drone={drone} />
                    ))}
                    {/* Render ship on top */}
                    <Ship ship={ship} velocityX={velocityX.current} />
                </Group>
            </Canvas>
            <View
                style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
                onTouchStart={handleTouch}
                onTouchMove={handleTouch}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
            />
        </View>
    )
}