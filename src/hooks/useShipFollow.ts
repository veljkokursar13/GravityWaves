import { useRef } from "react";
import { Gesture } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import type { Ship as ShipType } from "@/entities/ship/types";

type Bounds = { width: number; height: number };

/**
 * Gesture Handler-based ship movement.
 * Native performance - runs on UI thread with zero lag.
 * Pure delta-based movement (not tied to absolute coordinates).
 */
export function useShipFollow(
  ship: ShipType,
  bounds: Bounds,
  onMove: (dx: number, dy: number) => void,
  onTouchState: (touching: boolean) => void
) {
  // Track previous translation to calculate frame-to-frame delta
  const prevTranslation = useRef({ x: 0, y: 0 });

  const gesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      // Touch started - reset tracking and enable auto-fire
      prevTranslation.current = { x: 0, y: 0 };
      runOnJS(onTouchState)(true);
    })
    .onUpdate((event) => {
      'worklet';
      // translationX/Y are cumulative from gesture start
      // Calculate frame-to-frame delta
      const dx = event.translationX - prevTranslation.current.x;
      const dy = event.translationY - prevTranslation.current.y;
      
      // Update previous for next frame
      prevTranslation.current = { x: event.translationX, y: event.translationY };
      
      // Pass delta to movement handler (wrapped in runOnJS for React state updates)
      runOnJS(onMove)(dx, dy);
    })
    .onEnd(() => {
      'worklet';
      // Touch ended - disable auto-fire
      runOnJS(onTouchState)(false);
    })
    .onFinalize(() => {
      'worklet';
      // Gesture finished or cancelled (cleanup)
      prevTranslation.current = { x: 0, y: 0 };
      runOnJS(onTouchState)(false);
    });

  return gesture;
}