// Hook to handle the gravity implosion bomb attack from the boss
import { useState, useCallback } from 'react';

export interface Bomb {
  id: string;
  x: number;
  y: number;
  targetX: number; // Random target X position
  speed: number;
  active: boolean;
  imploding: boolean; // Activated on ship collision
  implosionTimer: number;
  implosionRadius: number;
}

export interface GravityImplosionBombState {
  bombs: Bomb[];
  burstTimer: number;
  burstCooldown: number;
  isInBurst: boolean;
  bombsInBurst: number;
  bombsFiredInCurrentBurst: number;
  timeBetweenBombsInBurst: number;
  timeSinceLastBomb: number;
}

const BURST_COOLDOWN = 5.0; // 5 seconds between bursts
const BOMBS_PER_BURST_MIN = 5;
const BOMBS_PER_BURST_MAX = 8;
const TIME_BETWEEN_BOMBS = 0.3; // 0.3 seconds between bombs in a burst
const BOMB_SPEED = 150; // Pixels per second
const IMPLOSION_DURATION = 1.5; // 1.5 seconds implosion effect
const MAX_IMPLOSION_RADIUS = 120; // Maximum implosion radius

export function useGravityImplosionBomb() {
  const [state, setState] = useState<GravityImplosionBombState>({
    bombs: [],
    burstTimer: BURST_COOLDOWN, // Start ready to fire
    burstCooldown: BURST_COOLDOWN,
    isInBurst: false,
    bombsInBurst: 0,
    bombsFiredInCurrentBurst: 0,
    timeBetweenBombsInBurst: TIME_BETWEEN_BOMBS,
    timeSinceLastBomb: 0,
  });

  const startBurst = useCallback((bossX: number, bossY: number, screenWidth: number) => {
    setState((prev) => ({
      ...prev,
      isInBurst: true,
      bombsInBurst: Math.floor(Math.random() * (BOMBS_PER_BURST_MAX - BOMBS_PER_BURST_MIN + 1)) + BOMBS_PER_BURST_MIN,
      bombsFiredInCurrentBurst: 0,
      timeSinceLastBomb: 0,
      burstTimer: 0,
    }));
  }, []);

  const fireBomb = useCallback((bossX: number, bossY: number, screenWidth: number) => {
    const newBomb: Bomb = {
      id: `bomb-${Date.now()}-${Math.random()}`,
      x: bossX,
      y: bossY + 20, // Slightly below boss
      targetX: Math.random() * screenWidth, // Random X target across screen
      speed: BOMB_SPEED,
      active: true,
      imploding: false,
      implosionTimer: 0,
      implosionRadius: 0,
    };

    setState((prev) => ({
      ...prev,
      bombs: [...prev.bombs, newBomb],
      bombsFiredInCurrentBurst: prev.bombsFiredInCurrentBurst + 1,
      timeSinceLastBomb: 0,
    }));
  }, []);

  const activateBomb = useCallback((bombId: string) => {
    setState((prev) => ({
      ...prev,
      bombs: prev.bombs.map((bomb) =>
        bomb.id === bombId
          ? { ...bomb, imploding: true, implosionTimer: 0 }
          : bomb
      ),
    }));
  }, []);

  const updateBombs = useCallback((dt: number, bossX: number, bossY: number, screenWidth: number, screenHeight: number) => {
    setState((prev) => {
      let newState = { ...prev };

      // Update burst timing
      if (!newState.isInBurst) {
        newState.burstTimer += dt;
        
        // Start new burst
        if (newState.burstTimer >= BURST_COOLDOWN) {
          newState.isInBurst = true;
          newState.bombsInBurst = Math.floor(Math.random() * (BOMBS_PER_BURST_MAX - BOMBS_PER_BURST_MIN + 1)) + BOMBS_PER_BURST_MIN;
          newState.bombsFiredInCurrentBurst = 0;
          newState.timeSinceLastBomb = 0;
          newState.burstTimer = 0;
        }
      } else {
        // In burst - fire bombs
        newState.timeSinceLastBomb += dt;
        
        if (newState.bombsFiredInCurrentBurst < newState.bombsInBurst) {
          if (newState.timeSinceLastBomb >= TIME_BETWEEN_BOMBS) {
            // Fire a bomb
            const newBomb: Bomb = {
              id: `bomb-${Date.now()}-${Math.random()}`,
              x: bossX,
              y: bossY + 20,
              targetX: Math.random() * screenWidth,
              speed: BOMB_SPEED,
              active: true,
              imploding: false,
              implosionTimer: 0,
              implosionRadius: 0,
            };
            
            newState.bombs = [...newState.bombs, newBomb];
            newState.bombsFiredInCurrentBurst += 1;
            newState.timeSinceLastBomb = 0;
          }
        } else {
          // Burst complete
          newState.isInBurst = false;
          newState.burstTimer = 0;
        }
      }

      // Update all bombs
      newState.bombs = newState.bombs
        .map((bomb) => {
          const updatedBomb = { ...bomb };

          if (updatedBomb.imploding) {
            // Update implosion effect
            updatedBomb.implosionTimer += dt;
            const progress = updatedBomb.implosionTimer / IMPLOSION_DURATION;
            updatedBomb.implosionRadius = MAX_IMPLOSION_RADIUS * Math.sin(progress * Math.PI);

            // Remove after implosion completes
            if (updatedBomb.implosionTimer >= IMPLOSION_DURATION) {
              updatedBomb.active = false;
            }
          } else {
            // Move bomb downward and toward target X
            updatedBomb.y += updatedBomb.speed * dt;
            
            // Move horizontally toward target
            const dx = updatedBomb.targetX - updatedBomb.x;
            const moveSpeed = Math.min(Math.abs(dx), 100 * dt);
            updatedBomb.x += Math.sign(dx) * moveSpeed;

            // Remove if off screen
            if (updatedBomb.y > screenHeight + 50) {
              updatedBomb.active = false;
            }
          }

          return updatedBomb;
        })
        .filter((bomb) => bomb.active);

      return newState;
    });
  }, []);

  const removeBomb = useCallback((bombId: string) => {
    setState((prev) => ({
      ...prev,
      bombs: prev.bombs.filter((bomb) => bomb.id !== bombId),
    }));
  }, []);

  return {
    state,
    startBurst,
    fireBomb,
    activateBomb,
    updateBombs,
    removeBomb,
  };
}
