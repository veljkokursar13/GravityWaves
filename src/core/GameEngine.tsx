import { Canvas, Group } from "@shopify/react-native-skia";
import { View, useWindowDimensions } from "react-native";
import { useState, useRef, useEffect, useCallback } from "react";
import { GestureDetector } from "react-native-gesture-handler";
import Ship from "@/entities/ship/Ship";
import MuzzleFlash from "@/entities/ship/MuzzleFlash";
import EnemyRenderer from "@/entities/enemies/EnemyRenderer";
import Bullet from "@/entities/projectiles/Bullet";
import ParticleExplosion from "@/entities/effects/ParticleExplosion";
import { initialShip, type Ship as ShipType } from "@/entities/ship/types";
import { useEnemies } from "@/entities/enemies/useEnemies";
import { useWaveManager } from "@/entities/waves/useWaveManager";
import { useBulletsOptimized } from "@/entities/projectiles/useBulletsOptimized";
import { useGameLoop } from "@/hooks/useGameLoop";
import { useCombo } from "@/hooks/useCombo";
import { useShootBooster } from "@/hooks/useShootBooster";
import { detectShipEnemyCollisions, detectBulletEnemyCollisions } from "@/core/systems/collision";
import { useStore } from "@/store/store";
import GameOverScreen from "@/core/overlays/GameOverScreen";
import Hud from "@/core/overlays/Hud";
import ComboCounter from "@/core/overlays/ComboCounter";
import BossIntro from "@/core/overlays/BossIntro";
import PowerUpIndicator from "@/core/overlays/PowerUpIndicator";
import LifeBar from "@/core/overlays/LifeBar";
import { useShipFollow } from "@/hooks/useShipFollow";
import { useCameraShake } from "@/hooks/useCameraShake";
import { useShipLives } from "@/entities/ship/useShipLives";
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

    const { bullets, updateBulletsRef, shoot, removeBullet } = useBulletsOptimized();
    
    // Refs for game state
    const previousShipX = useRef<number>(width / 2);
    const velocityX = useRef<number>(0);
    const gameOverTriggered = useRef<boolean>(false);
    
    // Muzzle flash - use ref for frame updates, state for periodic rendering
    const muzzleFlashTimeRef = useRef<number>(999);
    const [muzzleFlashTime, setMuzzleFlashTime] = useState<number>(999);
    const lastShotPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const lastShotWasDoubleRef = useRef<boolean>(false);
    
    // Particle explosions - use ref for frame updates, state for periodic rendering
    const explosionsRef = useRef<Array<{ id: string; x: number; y: number; time: number; color: string }>>([]);
    const [explosions, setExplosions] = useState<Array<{ id: string; x: number; y: number; time: number; color: string }>>([]);
    
    // Combo system
    const { combo, multiplier, addKill: addComboKill, reset: resetCombo } = useCombo();
    
    // Double shot booster (activated at score > 300)
    const doubleShot = useShootBooster();
    
    // Ship lives system (3 lives with invincibility frames)
    const { lives, isInvincible, takeDamage, resetLives, isDead } = useShipLives();
    
    // Boss intro
    const [showBossIntro, setShowBossIntro] = useState(false);
    const bossIntroShownRef = useRef(false);

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
            resetLives(); // Reset lives to 3
            resetCombo(); // Reset combo
        }
    }, [appState, width, height, resetLives, resetCombo]);

    // Periodic sync from refs to state for visual updates (10fps instead of 60fps)
    useEffect(() => {
        const interval = setInterval(() => {
            setMuzzleFlashTime(muzzleFlashTimeRef.current);
            setExplosions([...explosionsRef.current]);
        }, 100); // 10 times per second
        
        return () => clearInterval(interval);
    }, []);

    // Touch state for auto-fire
    const isTouchingRef = useRef<boolean>(false);
    
    // Callback to apply ship movement delta (called from gesture handler)
    const handleShipMove = useCallback((dx: number, dy: number) => {
        setShip((prev) => {
            const sensitivity = 1.5;
            let nx = prev.x + dx * sensitivity;
            let ny = prev.y + dy * sensitivity;
            
            // Clamp to bounds
            const halfW = prev.width / 2;
            const halfH = prev.height / 2;
            const minY = Math.max(halfH, height * 0.6 + halfH);
            const maxY = height - halfH;
            
            nx = Math.max(halfW, Math.min(width - halfW, nx));
            ny = Math.max(minY, Math.min(maxY, ny));
            
            return { ...prev, x: nx, y: ny };
        });
    }, [width, height]);
    
    // Callback to update touch state (for auto-fire)
    const handleTouchState = useCallback((touching: boolean) => {
        isTouchingRef.current = touching;
    }, []);
    
    // Create gesture handler
    const panGesture = useShipFollow(
        ship,
        { width, height }, 
        handleShipMove,
        handleTouchState
    );

    // Camera shake for impacts
    const { offset: cameraOffset, shake } = useCameraShake();

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
                
                // Combo system
                addComboKill();
                const comboScore = 10 * (enemy.kind === 'boss' ? 10 : 1) * multiplier;
                addScore(Math.floor(comboScore));
                addKills(1);
                
                // Camera shake on kill (subtle AAA polish)
                shake(enemy.kind === 'boss' ? 5 : 2);
                
                // Particle explosion with cap for performance (max 8 concurrent)
                const explosionColor = enemy.kind === 'boss' ? '#ff4400' : '#00dcff';
                const explosionId = `explosion-${enemy.id}-${Date.now()}`;
                // Update ref directly for performance - no setState
                const newExplosions = [...explosionsRef.current, {
                    id: explosionId,
                    x: enemy.x,
                    y: enemy.y,
                    time: 0,
                    color: explosionColor
                }];
                // Cap at 8 explosions for smooth 60fps performance
                explosionsRef.current = newExplosions.slice(-8);
            } else {
                damageEnemy(enemy.id, bullet.damage);
            }
        }
    };

    // Helper: Check for collisions and lives
    const checkGameOver = () => {
        // Skip collision check if invincible
        if (isInvincible) return;
        
        const shipCollisions = detectShipEnemyCollisions(ship, enemies);
        if (shipCollisions.length > 0) {
            const damaged = takeDamage();
            if (damaged) {
                shake(3); // Camera shake on hit
                resetCombo(); // Reset combo on damage
                
                // Check if dead after taking damage
                if (isDead && !gameOverTriggered.current) {
                    gameOverTriggered.current = true;
                    setAppState('gameover');
                }
            }
        }
    };

    // Frame update via useGameLoop
    useGameLoop((delta) => {
        const dt = Math.min(0.05, Math.max(0, delta)); // safety clamp

        // Calculate velocity for banking effect
        velocityX.current = (ship.x - previousShipX.current) / Math.max(dt, 1e-6);
        previousShipX.current = ship.x;

        // Auto-fire while finger is down (with double shot booster)
        if (isTouchingRef.current) {
            const bulletCountBefore = bullets.length;
            shoot(ship.x, ship.y, ship.height, doubleShot);
            // Trigger muzzle flash if a bullet was actually fired
            if (bullets.length > bulletCountBefore || muzzleFlashTimeRef.current < 0.03) {
                muzzleFlashTimeRef.current = 0;
                lastShotPositionRef.current = { x: ship.x, y: ship.y - ship.height / 2 };
                lastShotWasDoubleRef.current = doubleShot;
            }
        }
        
        // Update muzzle flash timer (ref only - no setState)
        muzzleFlashTimeRef.current = muzzleFlashTimeRef.current + dt;
        
        // Update particle explosions with 600ms cleanup (ref only - no setState)
        explosionsRef.current = explosionsRef.current
            .map(exp => ({ ...exp, time: exp.time + dt }))
            .filter(exp => exp.time < 0.6); // Remove after 600ms (extended for debris)
        
        // Check for boss wave (wave 10) and trigger intro at wave start
        if (currentWaveId === 10 && !bossIntroShownRef.current && phase === 'spawning') {
            setShowBossIntro(true);
            bossIntroShownRef.current = true;
        }

        updateBulletsRef(delta); // Updates ref only, not state
        processBulletCollisions();
        checkGameOver();
    }, paused || isGameOver);

    // Render
    return(
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
            <Canvas
                pointerEvents="none"
                style={{ flex: 1, backgroundColor: 'transparent' }}
            >
                <Group transform={[{ translateX: cameraOffset.x }, { translateY: cameraOffset.y }]}>
                    {/* Render bullets first (behind everything) */}
                    {bullets.map(bullet => (
                        <Bullet key={bullet.id} bullet={bullet} />
                    ))}
                    {/* Render enemies */}
                    {enemies.map(enemy => (
                        <EnemyRenderer key={enemy.id} enemy={enemy} />
                    ))}
                    {/* Render ship on top with invincibility flicker */}
                    <Ship ship={ship} velocityX={velocityX.current} isInvincible={isInvincible} />
                    {/* Muzzle flash effect (30ms) - single or double based on booster */}
                    {muzzleFlashTime < 0.03 && (
                        <>
                            {lastShotWasDoubleRef.current ? (
                                <>
                                    {/* Left wing flash */}
                                    <MuzzleFlash 
                                        x={lastShotPositionRef.current.x - 20} 
                                        y={lastShotPositionRef.current.y} 
                                        time={muzzleFlashTime} 
                                    />
                                    {/* Right wing flash */}
                                    <MuzzleFlash 
                                        x={lastShotPositionRef.current.x + 20} 
                                        y={lastShotPositionRef.current.y} 
                                        time={muzzleFlashTime} 
                                    />
                                </>
                            ) : (
                                /* Center flash */
                                <MuzzleFlash 
                                    x={lastShotPositionRef.current.x} 
                                    y={lastShotPositionRef.current.y} 
                                    time={muzzleFlashTime} 
                                />
                            )}
                        </>
                    )}
                    {/* Particle explosions */}
                    {explosions.map(explosion => (
                        <ParticleExplosion
                            key={explosion.id}
                            x={explosion.x}
                            y={explosion.y}
                            time={explosion.time}
                            color={explosion.color}
                            particleCount={explosion.color === '#ff4400' ? 25 : 15}
                        />
                    ))}
                </Group>
            </Canvas>
            
            {/* Gesture detector for ship control - native performance */}
            {!isGameOver && phase !== 'between' && (
                <GestureDetector gesture={panGesture}>
                    <View
                        style={{ 
                            position: 'absolute', 
                            top: 0, 
                            right: 0, 
                            bottom: 0, 
                            left: 0, 
                            zIndex: 1 
                        }}
                    />
                </GestureDetector>
            )}
            
            {/* HUD Overlay (score only) - higher zIndex to be on top */}
            <Hud />
            
            {/* Life Bar */}
            {!isGameOver && <LifeBar lives={lives} maxLives={3} isInvincible={isInvincible} />}
            
            {/* Power-up indicator */}
            {!isGameOver && <PowerUpIndicator doubleShot={doubleShot} />}
            
            {/* Combo Counter */}
            {!isGameOver && <ComboCounter combo={combo} multiplier={multiplier} />}
            
            {/* Wave Announcer between waves */}
            {phase === 'between' && !showBossIntro && <WaveAnouncer waveId={currentWaveId} />}
            
            {/* Boss Intro */}
            {showBossIntro && (
                <BossIntro 
                    bossName="SUPREME DESTROYER"
                    onComplete={() => setShowBossIntro(false)} 
            />
            )}
            
            {/* Game Over Overlay - highest priority */}
            {isGameOver && <GameOverScreen />}
        </View>
    )
}
