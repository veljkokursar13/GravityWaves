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
import { detectBulletEnemyCollisions, detectShipEnemyCollisions } from "@/core/systems/collision";
import type { Enemy } from "@/entities/enemies/types";
import WaveAnouncer from "@/core/overlays/WaveAnouncer";
import ParticleExplosion from "@/entities/effects/ParticleExplosion";

const BOTTOM_UI_HEIGHT = 80; // Reserved space at bottom for UI elements
const START_OFFSET_FROM_BOTTOM = 50; // Starting distance from bottom UI

export default function GameEngine() {
    const { width, height } = useWindowDimensions();
    const { appState, setAppState, addScore, addKills } = useStore();
    const paused = appState === 'paused';
    const isGameOver = appState === 'gameover';
    
    const [ship, setShip] = useState<ShipType>({
        ...initialShip,
        x: width / 2,
        y: height - BOTTOM_UI_HEIGHT - START_OFFSET_FROM_BOTTOM
    });

    const { bullets, updateBulletsRef, shoot, removeBullet } = useBulletsOptimized();
    
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
    
    const spawnExplosion = useCallback((x: number, y: number) => {
        const newExplosion: Explosion = {
            id: `exp-${Date.now()}-${Math.random()}`,
            x,
            y,
            time: 0
        };
        setExplosions(prev => [...prev, newExplosion]);
    }, []);
    
    // Combo system
    const { combo, multiplier, reset: resetCombo } = useCombo();
    
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
            setShip({
                ...initialShip,
                x: width / 2,
                y: height - BOTTOM_UI_HEIGHT - START_OFFSET_FROM_BOTTOM
            });
            previousShipX.current = width / 2;
            velocityX.current = 0;
            resetCombo(); // Reset combo (lives reset handled by store's resetGame)
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
                        const scoreByKind: Record<string, number> = { drone: 10, rogue: 15, heavy: 25, kamikaze: 12, boss: 200 };
                        addScore(scoreByKind[enemy.kind] ?? 10);
                        addKills(1);
                        spawnExplosion(enemy.x, enemy.y);
                    } else if (cause === 'passed') {
                        addScore(-100);
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
            const sensitivity = 1.5;
            let nx = prev.x + dx * sensitivity;
            let ny = prev.y + dy * sensitivity;
            
            // Clamp to bounds (reserve bottom UI height and lock top at half screen)
            const halfW = prev.width / 2;
            const halfH = prev.height / 2;
            const minY = Math.max(height / 2, halfH);
            const maxY = height - BOTTOM_UI_HEIGHT - halfH;
            
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
        
        // Update explosions
        setExplosions(prev => {
            return prev
                .map(exp => ({ ...exp, time: exp.time + dt }))
                .filter(exp => exp.time < 0.5); // Remove after 500ms
        });
        
        // Enemies update and collisions
        const em = enemyManagerRef.current;
        if (em) {
            // Move enemies
            em.update(dt, ship.x, ship.y);

            // Bullet → enemy collisions
            const bulletHits = detectBulletEnemyCollisions(bullets, em.enemies);
            const bulletsToRemove = new Set<string>();
            for (const { bullet, enemy } of bulletHits) {
                if (bulletsToRemove.has(bullet.id)) continue;
                em.damage(enemy.id, bullet.damage);
                bulletsToRemove.add(bullet.id);
            }
            bulletsToRemove.forEach((id) => removeBullet(id));

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
                    {/* Render order: Bullets → Enemies → Explosions → Ship (top) */}
                    
                    {/* Bullets (background layer) */}
                    {bullets.map(bullet => (
                        <Bullet key={bullet.id} bullet={bullet} />
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
            
            {/* No wave announcer or boss intro here */}

            {/* Game Over Overlay - highest priority */}
            {isGameOver && <GameOverScreen />}
        </View>
    )
}
