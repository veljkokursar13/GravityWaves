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
  const maxSpeed = 2200; // px/s, cap per-frame movement (faster response)
  const snapDistance = 1.5; // px

  const targetRef = useRef<{ x: number; y: number } | null>(null);
  const frameRef = useRef<number | null>(null);
  const posRef = useRef<{ x: number; y: number }>({ x: ship.x, y: ship.y });
  const lastTimeRef = useRef<number | null>(null);

  // Keep latest position in a ref for the animation loop
  useEffect(() => {
    posRef.current = { x: ship.x, y: ship.y };
  }, [ship.x, ship.y]);

  // Faster easing toward the target (more responsive when far)
  const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
  const easedStepRatio = (dist: number, dt: number) => {
    // base linear step from speed
    const base = Math.min(1, (maxSpeed * dt) / Math.max(1, dist));
    // boost more aggressively when far (up to +80%)
    const farBoost = 1 + Math.min(1, dist / 120) * 0.8;
    let boosted = Math.min(1, base * farBoost);
    // extra kick for large finger jumps
    if (dist > 160) boosted = Math.min(1, boosted + 0.15);
    return easeOutExpo(boosted);
  };

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
    const dt = Math.min(0.03, Math.max(0, (now - lastTimeRef.current) / 1000));
    lastTimeRef.current = now;

    const from = posRef.current;
    const dx = target.x - from.x;
    const dy = target.y - from.y;
    // Eased interpolation toward target
    const dist = Math.hypot(dx, dy);
    const ratio = dist > 0 ? easedStepRatio(dist, dt) : 1;
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
    // keep internal state in sync to avoid a one-frame lag
    posRef.current = { x: clampedX, y: clampedY };
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

      //keep the ship slightly above the finger
      const desiredX = locationX;
      const desiredY = locationY - ship.height * 0.5;
      targetRef.current = { x: desiredX, y: desiredY };
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




