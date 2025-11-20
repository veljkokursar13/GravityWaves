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
    // Bridge wave progression handler into the enemy hook without breaking hook order.
    const waveEnemyPassedRef = useRef<() => void>(() => {});

    const { enemies, spawnEnemy, killEnemy, damageEnemy } = useEnemies({
        bounds: { width, height },
        shipPosition: { x: ship.x, y: ship.y },
        onEnemyPassed: (_enemyId) => {
            addScore(-10);
            waveEnemyPassedRef.current();
        },
    });

    // Wave management
    const { currentWave, onEnemyKilled, onEnemyPassed: waveEnemyPassed } = useWaveManager({
        onSpawnEnemy: spawnEnemy
    });
    waveEnemyPassedRef.current = waveEnemyPassed;
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
    const {
        onTouchStart,
        onTouchMove,
        onTouchEnd,
        isTouchingRef,
    } = ShipControlls({
        ship,
        onMove: (x: number, y: number) => {
            setShip(prev => ({ ...prev, x, y }));
        },
        bounds: { width, height }
    });

    // Helper: Process bullet-enemy collisions
    const processBulletCollisions = () => {
        const bulletCollisionsAll = detectBulletEnemyCollisions(bullets, enemies);
        const bulletCollisions = bulletCollisionsAll.filter(({ enemy }) => {
            const enemyTop = enemy.y - enemy.height / 2;
            const enemyBottom = enemy.y + enemy.height / 2;
            return enemyBottom > 0 && enemyTop < height;
        });
        
        if (bulletCollisions.length === 0) return;

        const hitBulletIds = new Set(bulletCollisions.map(c => c.bullet.id));
        const processedEnemies = new Set<string>();
        
        for (const id of hitBulletIds) {
            removeBullet(id);
        }
        
        for (const { bullet, enemy } of bulletCollisions) {
            if (processedEnemies.has(enemy.id)) continue;
            
            processedEnemies.add(enemy.id);
            
            if (enemy.hp <= bullet.damage) {
                killEnemy(enemy.id);
                onEnemyKilled();
                addScore(10 * (enemy.kind === 'boss' ? 10 : 1));
                addKills(1);
            } else {
                damageEnemy(enemy.id, bullet.damage);
            }
        }
    };

    // Helper: Check for game over
    const checkGameOver = () => {
        const shipCollisions = detectShipEnemyCollisions(ship, enemies);
        if (shipCollisions.length > 0 && !gameOverTriggered.current) {
            gameOverTriggered.current = true;
            setAppState('gameover');
        }
    };

    // Centralized game loop
    useGameLoop((delta) => {
        const dt = Math.min(0.03, Math.max(0, delta));

        velocityX.current = (ship.x - previousShipX.current) / Math.max(dt, 1e-6);
        previousShipX.current = ship.x;

        if (appState === 'game' && isTouchingRef.current) {
            shoot(ship.x, ship.y, ship.height);
        }

        updateBullets(delta);
        processBulletCollisions();
        checkGameOver();
    }, paused || isGameOver);

    // Touch handlers: use simple ship controls + shoot gating
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
