// Input handling for the ship
import { useEffect, useCallback } from 'react';
import type { Ship } from './types';

interface ShipControlsProps {
  ship: Ship;
  onMove: (x: number, y: number) => void;
  bounds: { width: number; height: number };
}

export function useShipControls({ ship, onMove, bounds }: ShipControlsProps) {
  const handleTouch = useCallback(
    (event: any) => {
      const { locationX, locationY } = event.nativeEvent;
      
      // Clamp to bounds
      const clampedX = Math.max(ship.width / 2, Math.min(bounds.width - ship.width / 2, locationX));
      const clampedY = Math.max(ship.height / 2, Math.min(bounds.height - ship.height / 2, locationY));
      
      onMove(clampedX, clampedY);
    },
    [ship.width, ship.height, bounds.width, bounds.height, onMove]
  );

  return { handleTouch };
}

// Keyboard controls for web/desktop
export function useKeyboardControls({ ship, onMove, bounds }: ShipControlsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const speed = ship.speed;
      let newX = ship.x;
      let newY = ship.y;

      switch (event.key) {
        case 'ArrowLeft':
        case 'a':
          newX = Math.max(ship.width / 2, ship.x - speed);
          break;
        case 'ArrowRight':
        case 'd':
          newX = Math.min(bounds.width - ship.width / 2, ship.x + speed);
          break;
        case 'ArrowUp':
        case 'w':
          newY = Math.max(ship.height / 2, ship.y - speed);
          break;
        case 'ArrowDown':
        case 's':
          newY = Math.min(bounds.height - ship.height / 2, ship.y + speed);
          break;
        default:
          return;
      }

      onMove(newX, newY);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ship, onMove, bounds]);
}
