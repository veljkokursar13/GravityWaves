// Input handling for the ship
import { useEffect, useCallback, useRef } from 'react';
import type { Ship } from './types';

interface ShipControlsProps {
  ship: Ship;
  onMove: (x: number, y: number) => void;
  bounds: { width: number; height: number };
}

export function useShipControls({ ship, onMove, bounds }: ShipControlsProps) {
  // Tunables: offset and capped speed for smooth follow
  const offsetX = ship.width * 0.5;
  const offsetY = ship.height * 0.7;
  const maxSpeed = 900; // px/s, cap per-frame movement (prevents large jumps)
  const snapDistance = 0.5; // px

  const targetRef = useRef<{ x: number; y: number } | null>(null);
  const frameRef = useRef<number | null>(null);
  const posRef = useRef<{ x: number; y: number }>({ x: ship.x, y: ship.y });
  const lastTimeRef = useRef<number | null>(null);

  // Keep latest position in a ref for the animation loop
  useEffect(() => {
    posRef.current = { x: ship.x, y: ship.y };
  }, [ship.x, ship.y]);

  const step = useCallback(() => {
    const target = targetRef.current;
    if (!target) {
      frameRef.current = null;
      return;
    }
    const now = Date.now();
    if (lastTimeRef.current == null) {
      lastTimeRef.current = now;
      frameRef.current = requestAnimationFrame(step);
      return;
    }
    const dt = Math.max(0, (now - lastTimeRef.current) / 1000);
    lastTimeRef.current = now;

    const from = posRef.current;
    const dx = target.x - from.x;
    const dy = target.y - from.y;
    const dist = Math.hypot(dx, dy);
    const maxStep = Math.max(snapDistance, maxSpeed * dt);

    const ratio = dist > 0 ? Math.min(1, maxStep / dist) : 1;
    const nextX = from.x + dx * ratio;
    const nextY = from.y + dy * ratio;

    const clampedX = Math.max(
      ship.width / 2,
      Math.min(bounds.width - ship.width / 2, nextX)
    );
    const clampedY = Math.max(
      ship.height / 2,
      Math.min(bounds.height - ship.height / 2, nextY)
    );

    onMove(clampedX, clampedY);
    frameRef.current = requestAnimationFrame(step);
  }, [bounds.height, bounds.width, maxSpeed, onMove, ship.height, ship.width, snapDistance]);

  const ensureLoop = useCallback(() => {
    if (frameRef.current == null) {
      lastTimeRef.current = null;
      frameRef.current = requestAnimationFrame(step);
    }
  }, [step]);

  const handleTouch = useCallback(
    (event: any) => {
      const { locationX, locationY } = event.nativeEvent;
      const tx = Math.max(
        ship.width / 2,
        Math.min(bounds.width - ship.width / 2, locationX - offsetX)
      );
      const ty = Math.max(
        ship.height / 2,
        Math.min(bounds.height - ship.height / 2, locationY - offsetY)
      );
      targetRef.current = { x: tx, y: ty };
      ensureLoop();
    },
    [bounds.height, bounds.width, ensureLoop, offsetX, offsetY, ship.height, ship.width]
  );

  const handleTouchEnd = useCallback(() => {
    targetRef.current = null;
    if (frameRef.current != null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    lastTimeRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, []);

  return { handleTouch, handleTouchEnd };
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
