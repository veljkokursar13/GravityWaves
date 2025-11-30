import { Canvas, Group } from "@shopify/react-native-skia";
import { View, useWindowDimensions } from "react-native";
import { useState, useRef, useEffect, useCallback } from "react";
import { GestureDetector } from "react-native-gesture-handler";
import Ship from "@/entities/ship/Ship";
import Bullet from "@/entities/projectiles/Bullet";
import { initialShip, type Ship as ShipType } from "@/entities/ship/types";
import { useBulletsOptimized } from "@/entities/projectiles/useBulletsOptimized";
import { useGameLoop } from "@/hooks/useGameLoop";
import { useCombo } from "@/hooks/useCombo";
import { useShootBooster } from "@/hooks/useShootBooster";
import { useStore } from "@/store/store";
import GameOverScreen from "@/core/overlays/GameOverScreen";
import Hud from "@/core/overlays/Hud";
import ComboCounter from "@/core/overlays/ComboCounter";
import PowerUpIndicator from "@/core/overlays/PowerUpIndicator";
import BossIntro from "@/core/overlays/BossIntro";
import JetFlames from "@/entities/ship/JetFlames";
import JetEngineCircles from "@/entities/ship/JetEngineCircles";
import LifeBar from "@/core/overlays/LifeBar";
import { useShipFollow } from "@/hooks/useShipFollow";
import { useCameraShake } from "@/hooks/useCameraShake";
import { useShipLives } from "@/entities/ship/useShipLives";
import { EnemyManager } from "@/entities/enemies/enemyManager";
import { WaveManager } from "@/entities/enemies/waveManager";
import { WAVES } from "@/entities/enemies/waves";
import EnemySprite from "@/entities/enemies/EnemySprite";
import { detectBulletEnemyCollisions, detectShipEnemyCollisions, detectGravityFieldEffects, detectEnemyBulletShipCollisions, type GravityField } from "@/core/systems/collision";
import type { Enemy } from "@/entities/enemies/types";
import WaveAnouncer from "@/core/overlays/WaveAnouncer";
import ParticleExplosion from "@/entities/effects/ParticleExplosion";
import KamikazeExplosionEffect from "@/entities/effects/KamikazeExplosionEffect";
import { useAudio } from "@/hooks/useAudio";
import { useEnemyBullets } from "@/entities/projectiles/useEnemyBullets";
import EnemyBullets from "@/entities/projectiles/EnemyBullets";

const BOTTOM_UI_HEIGHT = 80; // Reserved space at bottom for UI elements
const START_OFFSET_FROM_BOTTOM = 50; // Starting distance from bottom UI

export default function GameEngine() {
    const { width, height } = useWindowDimensions();
    const { appState, setAppState, addScore, addKills } = useStore();
    const paused = appState === 'paused';
    const isGameOver = appState === 'gameover';
    const audio = useAudio();
    
    // Play game BGM when entering game
    useEffect(() => {
        const playGameMusic = async () => {
            try {
                await audio.stopMusic(); // Stop menu music
                await audio.playMusic('galacticheartbeat', { loop: true, volume: 0.7 });
            } catch (error) {
                // Silent fail - audio not critical
            }
        };
        
        playGameMusic();
        
        // Cleanup: stop game music when leaving
        return () => {
            audio.stopMusic().catch(() => {});
        };
    }, []); // Empty deps - only run on mount/unmount
    
    const [ship, setShip] = useState<ShipType>({
        ...initialShip,
        x: width / 2,
        y: height - BOTTOM_UI_HEIGHT - START_OFFSET_FROM_BOTTOM
    });

    const { bullets, updateBulletsRef, shoot, removeBullet } = useBulletsOptimized();
    const { bullets: enemyBullets, updateBullets: updateEnemyBullets, shootStraight: shootEnemyBullet, shootAtPlayer: shootEnemyBulletAtPlayer, removeBullet: removeEnemyBullet } = useEnemyBullets();
    
    // Refs for game state
    const previousShipX = useRef<number>(width / 2);
    const previousShipY = useRef<number>(height - BOTTOM_UI_HEIGHT - START_OFFSET_FROM_BOTTOM);
    const velocityX = useRef<number>(0);
    const velocityY = useRef<number>(0);
    const gameOverTriggered = useRef<boolean>(false);
    const enemyManagerRef = useRef<EnemyManager | null>(null);
    const waveManagerRef = useRef<WaveManager | null>(null);
    const [waveOverlay, setWaveOverlay] = useState<{ visible: boolean; wave: number }>({ visible: false, wave: 0 });
    const waveHideTimerRef = useRef<NodeJS.Timeout | null>(null);
    
    // Explosion effects
    interface Explosion { id: string; x: number; y: number; time: number; }
    const [explosions, setExplosions] = useState<Explosion[]>([]);
    
    // Kamikaze explosions (special effect)
    interface KamikazeExplosion { id: string; x: number; y: number; time: number; }
    const [kamikazeExplosions, setKamikazeExplosions] = useState<KamikazeExplosion[]>([]);
    
    // Gravity fields from kamikaze explosions
    const [gravityFields, setGravityFields] = useState<GravityField[]>([]);
    
    // Drunk effect state (3 second duration when hit by gravity field)
    const [drunkEffectEndTime, setDrunkEffectEndTime] = useState<number>(0);
    const isDrunk = Date.now() < drunkEffectEndTime;
    
    // Track which gravity fields have already dealt damage (prevent multiple hits)
    const hitGravityFields = useRef<Set<string>>(new Set());
    
    const spawnExplosion = useCallback((x: number, y: number, isKamikaze = false) => {
        const newExplosion: Explosion = {
            id: `exp-${Date.now()}-${Math.random()}`,
            x,
            y,
            time: 0
        };
        setExplosions(prev => [...prev, newExplosion]);
        
        // Special kamikaze explosion effect
        if (isKamikaze) {
            const kamikazeExp: KamikazeExplosion = {
                id: `kamikaze-${Date.now()}-${Math.random()}`,
                x,
                y,
                time: 0
            };
            setKamikazeExplosions(prev => [...prev, kamikazeExp]);
            
            // Create gravity field
            const field: GravityField = {
                id: `gravity-${Date.now()}-${Math.random()}`,
                x,
                y,
                radius: 0,
                strength: 1.0,
                time: 0
            };
            setGravityFields(prev => [...prev, field]);
        }
    }, []);
    
    // Combo system
    const { combo, multiplier, addKill: addComboKill, reset: resetCombo } = useCombo();
    
    // Double shot booster (activated at score > 300)
    const doubleShot = useShootBooster();
    
    // Ship lives system (3 lives with invincibility frames)
    const { lives, isInvincible, takeDamage, isDead } = useShipLives();
    
    // Boss intro
    const [showBossIntro, setShowBossIntro] = useState(false);
    const bossIntroShownRef = useRef(false);

    // Reset game when coming back from game over
    useEffect(() => {
        if (appState === 'game' && gameOverTriggered.current) {
            gameOverTriggered.current = false;
            
            // Reset ship position
            setShip({
                ...initialShip,
                x: width / 2,
                y: height - BOTTOM_UI_HEIGHT - START_OFFSET_FROM_BOTTOM
            });
            previousShipX.current = width / 2;
            velocityX.current = 0;
            
            // Reset combo
            resetCombo();
            
            // Reset wave manager to wave 1
            if (waveManagerRef.current) {
                waveManagerRef.current = new WaveManager(
                    WAVES,
                    (cfg: any) => enemyManagerRef.current?.spawn(cfg),
                    ({ wave, untilMs }) => {
                        setWaveOverlay({ visible: true, wave });
                        if (waveHideTimerRef.current) clearTimeout(waveHideTimerRef.current);
                        waveHideTimerRef.current = setTimeout(() => {
                            setWaveOverlay((prev) => ({ ...prev, visible: false }));
                            waveHideTimerRef.current = null;
                        }, Math.max(250, untilMs));
                    }
                );
                waveManagerRef.current.startWave(); // Start wave 1
            }
            
            // Clear all enemies
            if (enemyManagerRef.current) {
                enemyManagerRef.current.enemies = [];
            }
            
            // Reset boss intro flag
            bossIntroShownRef.current = false;
            setShowBossIntro(false);
            
            // Clear explosions and gravity fields
            setExplosions([]);
            setKamikazeExplosions([]);
            setGravityFields([]);
            hitGravityFields.current.clear();
        }
    }, [appState, width, height, resetCombo]);

    // Trigger game over when lives reach 0
    useEffect(() => {
        if (isDead && !gameOverTriggered.current) {
            gameOverTriggered.current = true;
            setAppState('gameover');
        }
    }, [isDead, setAppState]);

    // Ensure store appState is 'game' when engine mounts so waves can start
    useEffect(() => {
        if (appState !== 'game') {
            setAppState('game');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Initialize enemy and wave managers and start waves when in game
    useEffect(() => {
        if (!enemyManagerRef.current) {
            enemyManagerRef.current = new EnemyManager(
                { width, height },
                (enemy: Enemy, cause: "killed" | "passed") => {
                    if (cause === "killed") {
                        const scoreByKind: Record<string, number> = { drone: 10, rogue: 15, heavy: 25, kamikaze: 12, boss: 200, armoredDrone: 20 };
                        addScore(scoreByKind[enemy.kind] ?? 10);
                        if(enemy.kind ==='drone'){
                            addScore(10);
                        } else if(enemy.kind ==='rogue'){
                            addScore(30);
                        } else if(enemy.kind ==='armoredDrone'){
                            addScore(50);
                        } else if(enemy.kind ==='kamikaze'){
                            addScore(55);
                        } else if(enemy.kind ==='boss'){
                            addScore(200);
                        }
                        addKills(1);
                        addComboKill(); // Increment combo counter
                        // Special explosion for kamikaze
                        spawnExplosion(enemy.x, enemy.y, enemy.kind === 'kamikaze');
                        // Extra shake for kamikaze
                        if (enemy.kind === 'kamikaze') {
                            shake(15);
                        }
                    } if (cause === 'passed' && enemy.kind !== 'boss') {

                        addScore(-10);
                    }
                    waveManagerRef.current?.enemyRemoved();
                }
            );
        }
        if (!waveManagerRef.current) {
            waveManagerRef.current = new WaveManager(
                WAVES,
                (cfg: any) => enemyManagerRef.current?.spawn(cfg),
                ({ wave, untilMs }) => {
                    setWaveOverlay({ visible: true, wave });
                    if (waveHideTimerRef.current) clearTimeout(waveHideTimerRef.current);
                    waveHideTimerRef.current = setTimeout(() => {
                        setWaveOverlay((prev) => ({ ...prev, visible: false }));
                        waveHideTimerRef.current = null;
                    }, Math.max(250, untilMs));
                }
            );
        }
        if (appState === "game") {
            if (waveManagerRef.current.phase !== 'inWave' && waveManagerRef.current.remaining === 0) {
                waveManagerRef.current.startWave();
            }
        }
    }, [width, height, appState, addScore, addKills, spawnExplosion]);

    // Unconditional wave start on mount (ensures waves begin even if appState timing differs)
    useEffect(() => {
        if (waveManagerRef.current && waveManagerRef.current.phase !== 'inWave' && waveManagerRef.current.remaining === 0) {
            waveManagerRef.current.startWave();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Periodic sync placeholder (reserved for future UI updates)

    // Touch state for auto-fire
    const isTouchingRef = useRef<boolean>(false);
    
    // Callback to apply ship movement delta (called from gesture handler)
    const handleShipMove = useCallback((dx: number, dy: number) => {
        setShip((prev) => {
            // Reduce sensitivity when drunk effect is active
            const sensitivity = isDrunk ? 0.75 : 1.5;
            let nx = prev.x + dx * sensitivity;
            let ny = prev.y + dy * sensitivity;
            
            // Add drunk wobble movement when effect is active
            if (isDrunk) {
                const wobble = Math.sin(Date.now() / 80) * 15;
                nx += wobble;
            }
            
            // Clamp to bounds (reserve bottom UI height and lock top at half screen)
            const halfW = prev.width / 2;
            const halfH = prev.height / 2;
            const minY = Math.max(height / 2, halfH);
            const maxY = height - BOTTOM_UI_HEIGHT - halfH;
            
            nx = Math.max(halfW, Math.min(width - halfW, nx));
            ny = Math.max(minY, Math.min(maxY, ny));
            
            return { ...prev, x: nx, y: ny };
        });
    }, [width, height, isDrunk]);
    
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

    // No enemy or wave collisions handled in this module

    // Frame update via useGameLoop
    useGameLoop((delta) => {
        const dt = Math.min(0.05, Math.max(0, delta)); // safety clamp

        // Calculate velocity for banking effect
        velocityX.current = (ship.x - previousShipX.current) / Math.max(dt, 1e-6);
        velocityY.current = (ship.y - previousShipY.current) / Math.max(dt, 1e-6);
        previousShipX.current = ship.x;
        previousShipY.current = ship.y;

        // Auto-fire while finger is down (with double shot booster)
        if (isTouchingRef.current) {
            shoot(ship.x, ship.y, ship.height, doubleShot);
        }
        
        updateBulletsRef(delta); // Updates ref only, not state
        updateEnemyBullets(delta); // Update enemy bullets
        
        // Update explosions
        setExplosions(prev => {
            return prev
                .map(exp => ({ ...exp, time: exp.time + dt }))
                .filter(exp => exp.time < 0.5); // Remove after 500ms
        });
        
        // Update kamikaze explosions
        setKamikazeExplosions(prev => {
            return prev
                .map(exp => ({ ...exp, time: exp.time + dt }))
                .filter(exp => exp.time < 0.5); // Remove after 500ms
        });
        
        // Update gravity fields (expanding and fading)
        setGravityFields(prev => {
            const updated = prev
                .map(f => {
                    const newRadius = f.radius + 200 * dt; // Expand 200px/sec
                    const maxRadius = 200; // Cap at 200px radius
                    
                    return {
                        ...f,
                        time: f.time + dt,
                        radius: Math.min(newRadius, maxRadius), // Cap radius
                        strength: Math.max(0, 1.0 - (f.time / 1.5)) // Fade over 1.5 seconds (faster)
                    };
                })
                .filter(f => f.time < 1.5); // Remove after 1.5s (shorter duration)
            
            // Cleanup hit tracking when field expires
            const activeFieldIds = new Set(updated.map(f => f.id));
            const keysToRemove: string[] = [];
            hitGravityFields.current.forEach(id => {
                if (!activeFieldIds.has(id)) {
                    keysToRemove.push(id);
                }
            });
            keysToRemove.forEach(id => hitGravityFields.current.delete(id));
            
            return updated;
        });
        
        // Check if ship enters gravity field (apply damage + drunk effect once per field)
        if (gravityFields.length > 0 && !isInvincible) {
            const gravityEffects = detectGravityFieldEffects(ship, gravityFields);
            
            if (gravityEffects.length > 0) {
                // Sum all gravity pushes for movement
                let totalPushX = 0, totalPushY = 0;
                
                for (const effect of gravityEffects) {
                    totalPushX += effect.pushX;
                    totalPushY += effect.pushY;
                    
                    // Check if this is a new gravity field hit
                    const fieldId = effect.field.id;
                    if (!hitGravityFields.current.has(fieldId)) {
                        // Mark field as hit
                        hitGravityFields.current.add(fieldId);
                        
                        // Apply damage (1 life lost)
                        takeDamage();
                        
                        // Activate drunk effect for 2 seconds (reduced from 3)
                        setDrunkEffectEndTime(Date.now() + 2000);
                        
                        // Camera shake
                        shake(8);
                    }
                }
                
                // Apply repulsive push force
                setShip(prev => {
                    const halfW = prev.width / 2;
                    const halfH = prev.height / 2;
                    const minY = Math.max(height / 2, halfH);
                    const maxY = height - BOTTOM_UI_HEIGHT - halfH;
                    
                    let newX = prev.x + totalPushX * dt;
                    let newY = prev.y + totalPushY * dt;
                    
                    // Clamp to bounds
                    newX = Math.max(halfW, Math.min(width - halfW, newX));
                    newY = Math.max(minY, Math.min(maxY, newY));
                    
                    return { ...prev, x: newX, y: newY };
                });
            }
        }
        //hit by boss gravity implosion bomb
        //hit by boss laser beam attack
        // Enemies update and collisions
        const em = enemyManagerRef.current;
        if (em) {
            // Move enemies
            em.update(dt, ship.x, ship.y);
            
            // Check for boss spawn and trigger intro (once per boss)
            if (!bossIntroShownRef.current && em.enemies.some(e => e.kind === 'boss')) {
                bossIntroShownRef.current = true;
                setShowBossIntro(true);
            }

            // Enemy shooting logic (armored drones, heavy, and boss)
            for (const enemy of em.enemies) {
                if (enemy.shootCooldown !== undefined) {
                    enemy.shootCooldown -= dt;
                    if (enemy.shootCooldown <= 0) {
                        // Boss shoots tracking bullets at player
                        if (enemy.kind === 'boss') {
                            shootEnemyBulletAtPlayer(enemy.x, enemy.y, enemy.height, ship.x, ship.y);
                            enemy.shootCooldown = 0.8 + Math.random() * 0.4; // Faster shooting: 0.8-1.2s
                        } else {
                            // Armored drones and heavy shoot straight down
                            shootEnemyBullet(enemy.x, enemy.y, enemy.height);
                            enemy.shootCooldown = 1.2 + Math.random() * 0.8; // Random cooldown 1.2-2.0s
                        }
                    }
                }
            }

            // Bullet → enemy collisions
            const bulletHits = detectBulletEnemyCollisions(bullets, em.enemies);
            const bulletsToRemove = new Set<string>();
            for (const { bullet, enemy } of bulletHits) {
                if (bulletsToRemove.has(bullet.id)) continue;
                em.damage(enemy.id, bullet.damage);
                bulletsToRemove.add(bullet.id);
            }
            bulletsToRemove.forEach((id) => removeBullet(id));
            
            // Enemy bullets → ship collisions (respect invincibility)
            if (!isInvincible) {
                const enemyBulletHits = detectEnemyBulletShipCollisions(ship as any, enemyBullets);
                const enemyBulletsToRemove = new Set<string>();
                
                for (const { bullet } of enemyBulletHits) {
                    if (enemyBulletsToRemove.has(bullet.id)) continue;
                    
                    // Take damage (1 life per bullet)
                    takeDamage();
                    enemyBulletsToRemove.add(bullet.id);
                    
                    // Small shake on hit
                    shake(5);
                }
                
                // Remove enemy bullets that hit the ship
                enemyBulletsToRemove.forEach((id) => removeEnemyBullet(id));
            }

            // Ship → enemy collisions (respect invincibility)
            if (!isInvincible) {
                const shipHits = detectShipEnemyCollisions(ship as any, em.enemies);
                if (shipHits.length > 0) {
                    if (takeDamage()) {
                        em.removeEnemy(shipHits[0].enemy.id, "killed");
                    }
                }
            }
        }
    }, paused || isGameOver);

    // Render
    return(
        <View style={{ flex: 1, backgroundColor: 'transparent', zIndex: 10 }}>
            <Canvas
                pointerEvents="none"
                style={{ flex: 1, backgroundColor: 'transparent' }}
            >
                <Group transform={[{ translateX: cameraOffset.x }, { translateY: cameraOffset.y }]}>
                    {/* Render order: Bullets → Enemy Bullets → Enemies → Explosions → Ship (top) */}
                    
                    {/* Player Bullets (background layer) */}
                    {bullets.map(bullet => (
                        <Bullet key={bullet.id} bullet={bullet} />
                    ))}
                    
                    {/* Enemy Bullets (pink) */}
                    {enemyBullets.map(bullet => (
                        <EnemyBullets key={bullet.id} bullet={bullet} />
                    ))}
                    
                    {/* Enemies */}
                    {enemyManagerRef.current?.enemies.map(e => (
                        <EnemySprite key={e.id} enemy={e} />
                    ))}
                    
                    {/* Explosions */}
                    {explosions.map(exp => (
                        <ParticleExplosion 
                            key={exp.id} 
                            x={exp.x} 
                            y={exp.y} 
                            time={exp.time}
                        />
                    ))}
                    
                    {/* Kamikaze Explosions (special effect) */}
                    {kamikazeExplosions.map(exp => (
                        <KamikazeExplosionEffect 
                            key={exp.id} 
                            x={exp.x} 
                            y={exp.y} 
                            time={exp.time}
                        />
                    ))}

                    {/* Jet flames behind ship when moving */}
                    {(() => {
                        const speed = Math.hypot(velocityX.current, velocityY.current);
                        // Threshold and scaling tuned for natural feel
                        const intensity = Math.max(0, Math.min(1, (speed - 100) / 800));
                        if (intensity <= 0) return null;
                        return (
                            <>
                                {/* Engine glow circles */}
                                <JetEngineCircles
                                    x={ship.x}
                                    y={ship.y}
                                    shipWidth={ship.width}
                                    shipHeight={ship.height}
                                    intensity={intensity}
                                />
                                {/* Flame trails */}
                                <JetFlames
                                    x={ship.x}
                                    y={ship.y}
                                    shipWidth={ship.width}
                                    shipHeight={ship.height}
                                    intensity={intensity}
                                />
                            </>
                        );
                    })()}

                    {/* Ship (always on top) */}
                    <Ship ship={ship} velocityX={velocityX.current} isInvincible={isInvincible} />
                </Group>
            </Canvas>
            <WaveAnouncer wave={waveOverlay.wave} visible={waveOverlay.visible} />
            
            {/* Gesture detector for ship control - native performance */}
            {!isGameOver && (
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
            <LifeBar />
            <Hud />
            
            {/* Power-up indicator */}
            {!isGameOver && <PowerUpIndicator />}
            
            {/* Combo Counter */}
            {!isGameOver && <ComboCounter combo={combo} multiplier={multiplier} />}
            
            {/* Boss Intro */}
            {showBossIntro && (
                <BossIntro 
                    bossName="MOTHERSHIP"
                    onComplete={() => setShowBossIntro(false)}
                />
            )}

            {/* Game Over Overlay - highest priority */}
            {isGameOver && <GameOverScreen />}
        </View>
    )
}
