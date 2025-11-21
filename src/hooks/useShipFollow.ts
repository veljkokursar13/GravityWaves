import { useCallback, useRef } from "react";
import type { Ship } from "@/entities/ship/types";

type Bounds = { width: number; height: number };

export function useShipFollow(ship: Ship, bounds: Bounds) {
  const target = useRef<{ x: number; y: number } | null>(null);

  const onTouch = useCallback((e: any) => {
    const t = e?.nativeEvent?.touches?.[0];
    if (!t) return;
    target.current = { x: t.pageX, y: t.pageY };
  }, []);

  const onTouchEnd = useCallback(() => {
    target.current = null;
  }, []);

  const update = useCallback(
    (shipPos: { x: number; y: number }) => {
      if (!target.current) return shipPos;

      const halfW = ship.width / 2;
      const halfH = ship.height / 2;
      const minY = Math.max(halfH, bounds.height * 0.6 + halfH);
      const maxY = bounds.height - halfH;

      const tx = Math.max(halfW, Math.min(bounds.width - halfW, target.current.x));
      const ty = Math.max(minY, Math.min(maxY, target.current.y));

      return { x: tx, y: ty };
    },
    [bounds.width, bounds.height, ship.width, ship.height]
  );

  return { onTouch, onTouchEnd, update };
}
