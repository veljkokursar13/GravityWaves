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
import useJoystick from "@/hooks/useJoystick";
import Joystick from "@/core/overlays/Joystick";
import WaveAnouncer from "@/core/overlays/WaveAnouncer";

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
    const { currentWave, currentWaveId, phase, onEnemyKilled, onEnemyPassed: waveEnemyPassed } = useWaveManager({
        onSpawnEnemy: spawnEnemy,
        bounds: { width, height },
    });
    waveEnemyPassedRef.current = waveEnemyPassed;

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

    // Joystick controls
    const { vector, onMove, onRelease } = useJoystick();

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

        // ----- JOYSTICK MOVEMENT -----
        // vector is normalized [-1, 1] with deadzone applied by the hook
        let vx = vector.x;
        let vy = vector.y;

        // Optional extra deadzone
        const mag = Math.hypot(vx, vy);
        if (mag < 0.05) {
            vx = 0;
            vy = 0;
        }

        const speed = ship.speed ?? 450; // px/s
        let nextX = ship.x + vx * speed * dt;
        let nextY = ship.y + vy * speed * dt; // RN y+ is down, so keep +
        // Clamp to screen
        const halfW = ship.width / 2;
        const halfH = ship.height / 2;
        if (nextX < halfW) nextX = halfW;
        if (nextX > width - halfW) nextX = width - halfW;
        if (nextY < halfH) nextY = halfH;
        if (nextY > height - halfH) nextY = height - halfH;
        if (nextX !== ship.x || nextY !== ship.y) {
            setShip(prev => ({ ...prev, x: nextX, y: nextY }));
        }
        // Auto-fire while moving
        if (mag > 0.05) {
            shoot(ship.x, ship.y, ship.height);
        }

        updateBullets(dt);
        processBulletCollisions();
        checkGameOver();
    }, paused || isGameOver);

    // Render
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
            {/* HUD Overlay (score only) */}
            <Hud />
            {/* Wave Announcer between waves */}
            {phase === 'between' && <WaveAnouncer waveId={currentWaveId} />}
            {/* Joystick */}
            <Joystick onMove={onMove} onRelease={onRelease} />
            {/* Game Over Overlay */}
            {isGameOver && <GameOverScreen />}
        </View>
    )
}
