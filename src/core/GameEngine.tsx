import { Canvas, Group } from "@shopify/react-native-skia";
import { View, useWindowDimensions } from "react-native";
import { useState, useRef, useEffect } from "react";
import Ship from "@/entities/ship/Ship";
import EnemyRenderer from "@/entities/enemies/EnemyRenderer";
import Bullet from "@/entities/projectiles/Bullet";
import { initialShip, type Ship as ShipType } from "@/entities/ship/types";
import { useEnemies } from "@/entities/enemies/useEnemies";
import { useWaveManager } from "@/entities/waves/useWaveManager";
import { useShipBullets } from "@/entities/projectiles/useBullets";
import { useGameLoop } from "@/hooks/useGameLoop";
import { detectShipEnemyCollisions, detectBulletEnemyCollisions } from "@/core/systems/collision";
import { useStore } from "@/store/store";
import GameOverScreen from "@/core/overlays/GameOverScreen";
import Hud from "@/core/overlays/Hud";
import ShipControlls from "@/entities/ship/ShipControlls";

export default function GameEngine() {
    const { width, height } = useWindowDimensions();
    const { appState, setAppState, addScore, addKills } = useStore();
    const paused = appState === 'paused';
    const isGameOver = appState === 'gameover';
    
    const [ship, setShip] = useState<ShipType>({ 
        ...initialShip, 
        x: width / 2, 
        y: height - 50 
    });

    // Enemy management
    const { enemies, spawnEnemy, killEnemy, damageEnemy } = useEnemies({
        bounds: { width, height },
        shipPosition: { x: ship.x, y: ship.y },
        onEnemyPassed: () => {
            addScore(-10);
            onEnemyPassed();
        },
    });

    // Wave management
    const { currentWave, enemiesRemaining, onEnemyKilled, onEnemyPassed } = useWaveManager({
        onSpawnEnemy: spawnEnemy
    });
    const waveId = currentWave?.id ?? 1;

    const { bullets, updateBullets, shoot, removeBullet } = useShipBullets();
    
    // Refs for game state
    const previousShipX = useRef<number>(width / 2);
    const velocityX = useRef<number>(0);
    const gameOverTriggered = useRef<boolean>(false);

    // Reset game when coming back from game over
    useEffect(() => {
        if (appState === 'game' && gameOverTriggered.current) {
            gameOverTriggered.current = false;
            setShip({ 
                ...initialShip, 
                x: width / 2, 
                y: height - 50 
            });
            previousShipX.current = width / 2;
            velocityX.current = 0;
        }
    }, [appState, width, height]);

    // Input handler from simple controls: updates ship position directly
    const controls = ShipControlls({
        ship,
        onMove: (x: number, y: number) => {
            setShip(prev => ({ ...prev, x, y }));
        },
        bounds: { width, height }
    });

    // Centralized game loop
    useGameLoop((delta) => {
        // Clamp dt to avoid spikes
        const dt = Math.min(0.03, Math.max(0, delta));

        // Derive horizontal velocity from actual position changes (for banking or future use)
        velocityX.current = (ship.x - previousShipX.current) / Math.max(dt, 1e-6);
        previousShipX.current = ship.x;

        // Auto-shoot only while touching the screen
        if (appState === 'game' && controls.isTouchingRef.current) {
            shoot(ship.x, ship.y, ship.height);
        }

        // Update bullets
        updateBullets(delta);

        // Check bullet-enemy collisions (only for enemies visible on screen)
        const bulletCollisionsAll = detectBulletEnemyCollisions(bullets, enemies);
        const bulletCollisions = bulletCollisionsAll.filter(({ enemy }) => {
            const enemyTop = enemy.y - enemy.height / 2;
            const enemyBottom = enemy.y + enemy.height / 2;
            return enemyBottom > 0 && enemyTop < height;
        });
        
        if (bulletCollisions.length > 0) {
            const hitBulletIds = new Set(bulletCollisions.map(c => c.bullet.id));
            const processedEnemies = new Set<string>();
            
            // Remove bullets and damage enemies
            hitBulletIds.forEach(id => removeBullet(id));
            
            bulletCollisions.forEach(({ bullet, enemy }) => {
                if (!processedEnemies.has(enemy.id)) {
                    processedEnemies.add(enemy.id);
                    
                    // Check if enemy will die from this hit
                    if (enemy.hp <= bullet.damage) {
                        killEnemy(enemy.id);
                        onEnemyKilled();
                        addScore(10 * (enemy.kind === 'boss' ? 10 : 1)); // Bosses worth 10x
                        addKills(1);
                    } else {
                        damageEnemy(enemy.id, bullet.damage);
                    }
                }
            });
        }
        
        // Check ship-enemy collisions
        const shipCollisions = detectShipEnemyCollisions(ship, enemies);
        if (shipCollisions.length > 0 && !gameOverTriggered.current) {
            gameOverTriggered.current = true;
            setAppState('gameover');
        }
    }, paused || isGameOver);

    // Touch handlers: use simple ship controls + shoot gating
    const onTouchStart = controls.onTouchStart;
    const onTouchMove = controls.onTouchMove;
    const onTouchEnd = controls.onTouchEnd;

    return(
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
            <Canvas style={{ flex: 1, backgroundColor: 'transparent' }}>
                <Group>
                    {/* Render bullets first (behind everything) */}
                    {bullets.map(bullet => (
                        <Bullet key={bullet.id} bullet={bullet} />
                    ))}
                    {/* Render enemies */}
                    {enemies.map(enemy => (
                        <EnemyRenderer key={enemy.id} enemy={enemy} />
                    ))}
                    {/* Render ship on top */}
                    <Ship ship={ship} velocityX={velocityX.current} />
                </Group>
            </Canvas>
            <View
                style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
                onStartShouldSetResponder={() => true}
                onMoveShouldSetResponder={() => true}
                onResponderGrant={onTouchStart}
                onResponderMove={onTouchMove}
                onResponderRelease={onTouchEnd}
                onResponderTerminate={onTouchEnd}
                onResponderTerminationRequest={() => true}
            />
            {/* HUD Overlay */}
            <Hud waveId={waveId} />
            {/* Game Over Overlay */}
            {isGameOver && <GameOverScreen />}
        </View>
    )
}
