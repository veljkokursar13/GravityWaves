import { useCallback, useEffect, useMemo, useRef } from "react";
import type { Ship } from "./types";

interface ShipControlsProps {
  ship: Ship;
  onMove: (x: number, y: number) => void;
  bounds: { width: number; height: number };
}

type TouchEvent = {
  nativeEvent: {
    locationX: number;
    locationY: number;
  };
};

export default function useShipControls({ ship, onMove, bounds }: ShipControlsProps) {
  const isTouchingRef = useRef(false);
  const dragActiveRef = useRef(false);
  const touchOffsetRef = useRef({ x: 0, y: 0 });
  const targetPositionRef = useRef({ x: ship.x, y: ship.y });
  const latestShipRef = useRef(ship);
  const onMoveRef = useRef(onMove);
  const animationFrameRef = useRef<number | null>(null);

  // Keep refs in sync with latest props/state values.
  useEffect(() => {
    latestShipRef.current = ship;
  }, [ship.x, ship.y, ship.width, ship.height]);

  useEffect(() => {
    if (!dragActiveRef.current) {
      targetPositionRef.current = { x: ship.x, y: ship.y };
    }
  }, [ship.x, ship.y]);

  useEffect(() => {
    onMoveRef.current = onMove;
  }, [onMove]);

  const clamp = useCallback((value: number, min: number, max: number) => {
    return Math.max(min, Math.min(max, value));
  }, []);

  const updateLatestShipPosition = useCallback((x: number, y: number) => {
    latestShipRef.current = { ...latestShipRef.current, x, y };
  }, []);

  const stopAnimation = useCallback(() => {
    if (animationFrameRef.current != null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Step ship position toward the latest touch target with a simple easing curve.
  const animateTowardsTarget = useCallback(() => {
  const { x: targetX, y: targetY } = targetPositionRef.current;
  const currentShip = latestShipRef.current;
    const dx = targetX - currentShip.x;
    const dy = targetY - currentShip.y;

  const distanceSquared = dx * dx + dy * dy;
  const reachedTarget = distanceSquared < 0.5;

    if (reachedTarget) {
      if (dragActiveRef.current) {
        onMoveRef.current(targetX, targetY);
        updateLatestShipPosition(targetX, targetY);
      }

      if (!dragActiveRef.current) {
        stopAnimation();
        return;
      }
    } else {
      const smoothing = dragActiveRef.current ? 0.35 : 0.2;
      const nextX = currentShip.x + dx * smoothing;
      const nextY = currentShip.y + dy * smoothing;
      onMoveRef.current(nextX, nextY);
      updateLatestShipPosition(nextX, nextY);
    }

    animationFrameRef.current = requestAnimationFrame(animateTowardsTarget);
  }, [stopAnimation, updateLatestShipPosition]);

  const ensureAnimationRunning = useCallback(() => {
    if (animationFrameRef.current?? null) {
      animationFrameRef.current = requestAnimationFrame(animateTowardsTarget);
    }
  }, [animateTowardsTarget]);

  const onTouchStart = useCallback(
  (event: TouchEvent) => {
      const { locationX, locationY } = event.nativeEvent;

      dragActiveRef.current = true;
      isTouchingRef.current = true;

      touchOffsetRef.current = {
        x: locationX - ship.x,
        y: locationY - ship.y,
      };

      targetPositionRef.current = { x: ship.x, y: ship.y };
      ensureAnimationRunning();
    },
    [ensureAnimationRunning, ship.x, ship.y]
  );

  const onTouchMove = useCallback(
  (event: TouchEvent) => {
      if (!dragActiveRef.current) return;

      const { locationX, locationY } = event.nativeEvent;

      const unclampedX = locationX - touchOffsetRef.current.x;
      const unclampedY = locationY - touchOffsetRef.current.y;

      const clampedX = clamp(unclampedX, ship.width / 2, bounds.width - ship.width / 2);
      const clampedY = clamp(unclampedY, ship.height / 2, bounds.height - ship.height / 2);

      targetPositionRef.current = { x: clampedX, y: clampedY };
      ensureAnimationRunning();
    },
    [bounds.height, bounds.width, clamp, ensureAnimationRunning, ship.height, ship.width]
  );

  const onTouchEnd = useCallback(() => {
    dragActiveRef.current = false;
    isTouchingRef.current = false;
    ensureAnimationRunning();
  }, [ensureAnimationRunning]);

  useEffect(() => {
    return () => {
      stopAnimation();
    };
  }, [stopAnimation]);

  const touchHandlers = useMemo(
    () => ({ onTouchStart, onTouchMove, onTouchEnd }),
    [onTouchEnd, onTouchMove, onTouchStart]
  );

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    isTouchingRef,
    touchHandlers,
  };
}
