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

const SMOOTHING = 0.28;
const STOP_THRESHOLD = 0.5;

export default function useShipControls({ ship, onMove, bounds }: ShipControlsProps) {
  const isTouchingRef = useRef(false);
  const dragActiveRef = useRef(false);
  const touchOffsetRef = useRef({ x: 0, y: 0 });
  const targetPositionRef = useRef({ x: ship.x, y: ship.y });
  const latestShipRef = useRef(ship);
  const onMoveRef = useRef(onMove);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    latestShipRef.current = ship;
    if (!dragActiveRef.current) {
      targetPositionRef.current = { x: ship.x, y: ship.y };
    }
  }, [ship.x, ship.y, ship.width, ship.height]);

  useEffect(() => {
    onMoveRef.current = onMove;
  }, [onMove]);

  const clamp = useCallback((value: number, min: number, max: number) => {
    return Math.max(min, Math.min(max, value));
  }, []);

  const stopAnimation = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const stepTowardsTarget = useCallback(() => {
    const current = latestShipRef.current;
    const target = targetPositionRef.current;

    const dx = target.x - current.x;
    const dy = target.y - current.y;
    const distanceSq = dx * dx + dy * dy;

    if (distanceSq <= STOP_THRESHOLD) {
      if (distanceSq > 0) {
        onMoveRef.current(target.x, target.y);
        latestShipRef.current = { ...current, x: target.x, y: target.y };
      }

      if (!dragActiveRef.current) {
        stopAnimation();
        return;
      }
    } else {
      const nextX = current.x + dx * SMOOTHING;
      const nextY = current.y + dy * SMOOTHING;

      onMoveRef.current(nextX, nextY);
      latestShipRef.current = { ...current, x: nextX, y: nextY };
    }

    animationFrameRef.current = requestAnimationFrame(stepTowardsTarget);
  }, [stopAnimation]);

  const ensureAnimation = useCallback(() => {
    animationFrameRef.current ??=
      requestAnimationFrame(stepTowardsTarget);
  }, [stepTowardsTarget]);

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
      ensureAnimation();
    },
    [ensureAnimation, ship.x, ship.y]
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
      ensureAnimation();
    },
    [bounds.height, bounds.width, clamp, ensureAnimation, ship.height, ship.width]
  );

  const onTouchEnd = useCallback(() => {
    dragActiveRef.current = false;
    isTouchingRef.current = false;
    ensureAnimation();
  }, [ensureAnimation]);

  useEffect(() => {
    return () => {
      stopAnimation();
    };
  }, [stopAnimation]);

  const touchHandlers = useMemo(
    () => ({
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    }),
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

