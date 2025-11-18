import { Canvas, Group } from "@shopify/react-native-skia";
import { View, useWindowDimensions } from "react-native";
import { useCallback, useState, useRef, useEffect } from "react";
import Ship from "@/entities/ship/Ship";
import EnemyRenderer from "@/entities/enemies/EnemyRenderer";
import Bullet from "@/entities/projectiles/Bullet";
import { initialShip, type Ship as ShipType } from "@/entities/ship/types";
import { useEnemies } from "@/entities/enemies/useEnemies";
import { useWaveManager } from "@/entities/waves/useWaveManager";
import { useBullets } from "@/entities/projectiles/useBullets";
import { useGameLoop } from "@/hooks/useGameLoop";
import { detectShipEnemyCollisions, detectBulletEnemyCollisions } from "@/core/systems/collision";
import { useStore } from "@/store/store";
import GameOverScreen from "@/core/overlays/GameOverScreen";
import Hud from "@/core/overlays/Hud";

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
        onEnemyPassed: () => onEnemyPassed(),
    });

    // Wave management
    const { currentWave, enemiesRemaining, onEnemyKilled, onEnemyPassed } = useWaveManager({
        onSpawnEnemy: spawnEnemy
    });
    const waveId = currentWave?.id ?? 1;

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
            gameOverTriggered.current = false;
            setShip({ 
                ...initialShip, 
                x: width / 2, 
                y: height - 50 
            });
            targetPos.current = { x: width / 2, y: height - 50 };
            previousShipX.current = width / 2;
            velocityX.current = 0;
        }
    }, [appState, width, height]);

    // Ship motion velocity (for spring-based motion)
    const shipVel = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    // Centralized game loop
    useGameLoop((delta) => {
        // Clamp dt to avoid spikes
        const dt = Math.min(0.03, Math.max(0, delta));

        // Critically-damped spring motion towards target position
        const fromX = ship.x;
        const fromY = ship.y;
        const tx = targetPos.current.x;
        const ty = targetPos.current.y;
        const dx = tx - fromX;
        const dy = ty - fromY;

        const stiffness = 16.0; // higher = snappier
        const damping = 2.8;    // higher = more damped

        // integrate velocity
        const vx = shipVel.current.x + (dx * stiffness - shipVel.current.x * damping) * dt;
        const vy = shipVel.current.y + (dy * stiffness - shipVel.current.y * damping) * dt;

        // cap velocity
        const maxV = 1600;
        const vmag = Math.hypot(vx, vy);
        const cvx = vmag > maxV ? (vx / vmag) * maxV : vx;
        const cvy = vmag > maxV ? (vy / vmag) * maxV : vy;
        shipVel.current = { x: cvx, y: cvy };

        // integrate position
        let nx = fromX + cvx * dt;
        let ny = fromY + cvy * dt;

        // clamp to bounds
        nx = Math.max(ship.width / 2, Math.min(width - ship.width / 2, nx));
        ny = Math.max(ship.height / 2, Math.min(height - ship.height / 2, ny));

        // Update banking velocity
        velocityX.current = (nx - previousShipX.current) / Math.max(dt, 1e-6);
        previousShipX.current = nx;

        // Update ship position
        setShip(prev => ({ ...prev, x: nx, y: ny }));

        // Auto-shoot only while touching the screen
        if (appState === 'game' && isTouching.current) {
            shoot(nx, ny, ship.height);
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
                onTouchStart={handleTouch}
                onTouchMove={handleTouch}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
            />
            {/* HUD Overlay */}
            <Hud waveId={waveId} />
            {/* Game Over Overlay */}
            {isGameOver && <GameOverScreen />}
        </View>
    )
}
