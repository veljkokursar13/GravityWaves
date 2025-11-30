// Hook to handle the laser beam attack from the boss
import { useState, useCallback } from 'react';

export interface LaserBeamState {
  active: boolean;
  charging: boolean;
  firing: boolean;
  chargeTimer: number;
  fireTimer: number;
  cooldownTimer: number;
  x: number;
  y: number;
}

const CHARGE_DURATION = 1.0; // 1 second charge time
const FIRE_DURATION = 3.0;   // 3 seconds firing time
const COOLDOWN = 30.0;       // 30 seconds between attacks

export function useLaserBeam() {
  const [laserBeam, setLaserBeam] = useState<LaserBeamState>({
    active: false,
    charging: false,
    firing: false,
    chargeTimer: 0,
    fireTimer: 0,
    cooldownTimer: COOLDOWN, // Start ready to fire
    x: 0,
    y: 0,
  });

  const startLaserBeam = useCallback((bossX: number, bossY: number) => {
    setLaserBeam({
      active: true,
      charging: true,
      firing: false,
      chargeTimer: 0,
      fireTimer: 0,
      cooldownTimer: 0,
      x: bossX,
      y: bossY,
    });
  }, []);

  const updateLaserBeam = useCallback((dt: number, bossX: number, bossY: number) => {
    setLaserBeam((prev) => {
      const newState = { ...prev };

      // Cooldown phase - waiting for next attack
      if (!newState.active) {
        newState.cooldownTimer += dt;
        
        // Start laser attack every 30 seconds
        if (newState.cooldownTimer >= COOLDOWN) {
          newState.active = true;
          newState.charging = true;
          newState.firing = false;
          newState.chargeTimer = 0;
          newState.fireTimer = 0;
          newState.cooldownTimer = 0;
          newState.x = bossX;
          newState.y = bossY;
        }
        return newState;
      }

      // Charging phase - preparing to fire
      if (newState.charging) {
        newState.chargeTimer += dt;
        newState.x = bossX; // Update position during charge
        newState.y = bossY;

        if (newState.chargeTimer >= CHARGE_DURATION) {
          newState.charging = false;
          newState.firing = true;
          newState.fireTimer = 0;
        }
        return newState;
      }

      // Firing phase - laser is active for 3 seconds
      if (newState.firing) {
        newState.fireTimer += dt;

        if (newState.fireTimer >= FIRE_DURATION) {
          // End laser attack, start cooldown
          newState.active = false;
          newState.firing = false;
          newState.cooldownTimer = 0;
        }
        return newState;
      }

      return newState;
    });
  }, []);

  const stopLaserBeam = useCallback(() => {
    setLaserBeam((prev) => ({
      ...prev,
      active: false,
      charging: false,
      firing: false,
      cooldownTimer: 0,
    }));
  }, []);

  return {
    laserBeam,
    startLaserBeam,
    updateLaserBeam,
    stopLaserBeam,
  };
}

