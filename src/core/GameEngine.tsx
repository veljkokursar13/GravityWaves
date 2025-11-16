import { Canvas, Group } from "@shopify/react-native-skia";
import { View, useWindowDimensions } from "react-native";
import { useCallback, useState, useRef, useEffect } from "react";
import Ship from "@/entities/ship/Ship";
import Drone from "@/entities/enemies/Drone";
import Bullet from "@/entities/projectiles/Bullet";
import { initialShip, type Ship as ShipType } from "@/entities/ship/types";
import { useDrones } from "@/entities/enemies/DroneSpawn";
import { useBullets } from "@/entities/projectiles/useBullets";
import { useGameLoop } from "@/hooks/useGameLoop";
import { detectCollisions, detectBulletDroneCollisions } from "@/core/systems/collision";
import { useStore } from "@/store/store";
import GameOverScreen from "@/core/overlays/GameOverScreen";
import Hud from "@/core/overlays/Hud";
import { WAVES, getWaveConfig } from '@/core/systems/waves';

export default function GameEngine() {
    const { width, height } = useWindowDimensions();
    const { appState, setAppState, score, currentWave, setCurrentWave, addScore, addKills } = useStore();
    const paused = appState === 'paused';
    const isGameOver = appState === 'gameover';
    
    const [ship, setShip] = useState<ShipType>({ 
        ...initialShip, 
        x: width / 2, 
        y: height - 50 
    });

    const waveConfig = getWaveConfig(currentWave);
    const { drones, updateDrones, removeDrone, getWaveProgress, drainPassed, resetWave } = useDrones(waveConfig);
    const { bullets, updateBullets, shoot, removeBullet } = useBullets();
    
    // Refs for game state
    const previousShipX = useRef<number>(width / 2);
    const velocityX = useRef<number>(0);
    const targetPos = useRef({ x: width / 2, y: height - 50 });
    const gameOverTriggered = useRef<boolean>(false);
    const isTouching = useRef<boolean>(false);

    // Reset game when coming back from game over
    useEffect(() => {
        if (appState === 'game' && gameOverTriggered.current) {
            // Reset game state after game over
            gameOverTriggered.current = false;
            setCurrentWave(1); // Reset wave on game restart
            // Reset ship position
            setShip({ 
                ...initialShip, 
                x: width / 2, 
                y: height - 50 
            });
            targetPos.current = { x: width / 2, y: height - 50 };
            previousShipX.current = width / 2;
            velocityX.current = 0;
        }
    }, [appState, width, height, setCurrentWave]);

    // Event-based waves (no score-based wave calculation)

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

        // Auto-shoot only while touching the screen
        if (appState === 'game' && isTouching.current) {
            shoot(newX, newY, ship.height);
        }

        // Update bullets
        updateBullets(delta);

        // Update drones
        updateDrones(delta, newX, newY);
        // Apply penalty for drones that passed the ship
        const passedIds = drainPassed();
        if (passedIds.length > 0) {
            addScore(-5 * passedIds.length);
        }
        
        // Check bullet-drone collisions (only for drones visible on screen)
        const bulletCollisionsAll = detectBulletDroneCollisions(bullets, drones);
        const bulletCollisions = bulletCollisionsAll.filter(({ drone }) => {
            const droneTop = drone.y - drone.height / 2;
            const droneBottom = drone.y + drone.height / 2;
            return droneBottom > 0 && droneTop < height;
        });
        if (bulletCollisions.length > 0) {
            // Remove hit bullets and drones, update score
            const hitBulletIds = new Set(bulletCollisions.map(c => c.bullet.id));
            const hitDroneIds = new Set(bulletCollisions.map(c => c.drone.id));
            
            hitBulletIds.forEach(id => removeBullet(id));
            hitDroneIds.forEach(id => removeDrone(id));
            if (hitDroneIds.size > 0) {
                addScore(10 * hitDroneIds.size);
                addKills(hitDroneIds.size);
            }
        }
        
        // Check ship-drone collisions
        const collisions = detectCollisions(ship, drones);
        if (collisions.length > 0 && !gameOverTriggered.current) {
            gameOverTriggered.current = true;
            setAppState('gameover');
        }

        // Wave completion: when all intended drones are spawned and none remain
        const progress = getWaveProgress();
        if (progress.spawned >= progress.total && progress.remaining === 0) {
            if (currentWave < WAVES.length) {
                resetWave();
                setCurrentWave(currentWave + 1);
            } else {
                // All waves completed
                setAppState('gameover');
            }
        }
    }, paused || isGameOver);

    const handleTouch = useCallback((event: any) => {
        isTouching.current = true;
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
        isTouching.current = false;
    }, []);

    return(
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
            <Canvas style={{ flex: 1, backgroundColor: 'transparent' }}>
                <Group>
                    {/* Render bullets first (behind everything) */}
                    {bullets.map(bullet => (
                        <Bullet key={bullet.id} bullet={bullet} />
                    ))}
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
            {/* HUD Overlay */}
            <Hud />
            {/* Game Over Overlay */}
            {isGameOver && <GameOverScreen />}
        </View>
    )
}