import { useCallback, useEffect, useRef } from 'react';
import type { Ship } from './types';

type ShipControlsProps = {
  ship: Ship;
  onMove: (x: number, y: number) => void;
  bounds: { width: number; height: number };
};

export default function ShipControlls({ ship, onMove, bounds }: ShipControlsProps) {
  const offsetX = ship.width / 2;
  const offsetY = ship.height / 2;

  const isTouchingRef = useRef(false);
  const targetRef = useRef<{ x: number; y: number } | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const posRef = useRef<{ x: number; y: number }>({ x: ship.x, y: ship.y });
  const velRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // keep internal position in sync with external ship state
  useEffect(() => {
    posRef.current = { x: ship.x, y: ship.y };
  }, [ship.x, ship.y]);

  const step = useCallback(() => {
    const now = Date.now();
    if (lastTimeRef.current == null) {
      lastTimeRef.current = now;
      frameRef.current = requestAnimationFrame(step);
      return;
    }
    const dt = Math.min(0.016, Math.max(0, (now - lastTimeRef.current) / 1000));
    lastTimeRef.current = now;

    const target = targetRef.current;
    if (!target) {
      // no target -> stop animating
      frameRef.current = null;
      return;
    }

    // Smooth spring-damper toward target with capped velocity
    const { x: cx, y: cy } = posRef.current;
    const { x: vx, y: vy } = velRef.current;
    const dx = target.x - cx;
    const dy = target.y - cy;
    const dist = Math.hypot(dx, dy);

    // Snap if very close to target
    if (dist < 0.5 && Math.hypot(vx, vy) < 1) {
      posRef.current = { x: target.x, y: target.y };
      velRef.current = { x: 0, y: 0 };
      onMove(target.x, target.y);
      frameRef.current = requestAnimationFrame(step);
      return;
    }

    // Tunables
    const stiffness = 38.0; // higher = snappier
    const damping = 12.6;   // ~critical damping for this stiffness
    const maxSpeed = 4800;  // px/s cap

    // Acceleration = k*(target-pos) - c*vel
    const ax = dx * stiffness - vx * damping;
    const ay = dy * stiffness - vy * damping;

    // Integrate velocity
    let nvx = vx + ax * dt;
    let nvy = vy + ay * dt;

    // Cap velocity
    const vmag = Math.hypot(nvx, nvy);
    if (vmag > maxSpeed) {
      nvx = (nvx / vmag) * maxSpeed;
      nvy = (nvy / vmag) * maxSpeed;
    }

    // Integrate position
    let nx = cx + nvx * dt;
    let ny = cy + nvy * dt;

    // clamp to bounds
    const clampedX = Math.max(offsetX, Math.min(bounds.width - offsetX, nx));
    const clampedY = Math.max(offsetY, Math.min(bounds.height - offsetY, ny));

    posRef.current = { x: clampedX, y: clampedY };
    velRef.current = { x: nvx, y: nvy };
    onMove(clampedX, clampedY);

    frameRef.current = requestAnimationFrame(step);
  }, [bounds.height, bounds.width, offsetX, offsetY, onMove]);

  const ensureLoop = useCallback(() => {
    if (frameRef.current == null) {
      lastTimeRef.current = null;
      frameRef.current = requestAnimationFrame(step);
    }
  }, [step]);

  const handle = useCallback((event: any) => {
    if (!event?.nativeEvent) return;
    const { touches, changedTouches } = event.nativeEvent;
    const primary =
      (Array.isArray(touches) && touches[0]) ||
      (Array.isArray(changedTouches) && changedTouches[0]) ||
      event.nativeEvent;
    const lx = (typeof primary.locationX === 'number' ? primary.locationX : primary.pageX) ?? 0;
    const ly = (typeof primary.locationY === 'number' ? primary.locationY : primary.pageY) ?? 0;

    let targetX = lx;
    let targetY = ly;

    // clamp to screen bounds
    targetX = Math.max(offsetX, Math.min(bounds.width - offsetX, targetX));
    targetY = Math.max(offsetY, Math.min(bounds.height - offsetY, targetY));

    // set target and ensure animation loop runs
    targetRef.current = { x: targetX, y: targetY };
    ensureLoop();
  }, [bounds.height, bounds.width, ensureLoop, offsetX, offsetY]);

  const onTouchStart = useCallback((e: any) => { isTouchingRef.current = true; handle(e); }, [handle]);
  const onTouchMove = useCallback((e: any) => { handle(e); }, [handle]);
  const onTouchEnd = useCallback(() => {
    isTouchingRef.current = false;
    targetRef.current = null;
    if (frameRef.current != null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    lastTimeRef.current = null;
    velRef.current = { x: 0, y: 0 };
  }, []);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, []);

  return { onTouchStart, onTouchMove, onTouchEnd, isTouchingRef };
}