import { useState, useRef, useCallback } from 'react';

interface ComboState {
  combo: number;
  multiplier: number;
  addKill: () => void;
  reset: () => void;
}

const COMBO_TIMEOUT = 2000; // 2 seconds to maintain combo
const BASE_MULTIPLIER = 1.0;
const MULTIPLIER_INCREMENT = 0.1;

export function useCombo(): ComboState {
  const [combo, setCombo] = useState(0);
  const [multiplier, setMultiplier] = useState(BASE_MULTIPLIER);
  const comboTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const reset = useCallback(() => {
    setCombo(0);
    setMultiplier(BASE_MULTIPLIER);
    if (comboTimeoutRef.current) {
      clearTimeout(comboTimeoutRef.current);
      comboTimeoutRef.current = null;
    }
  }, []);

  const addKill = useCallback(() => {
    setCombo((prev) => {
      const newCombo = prev + 1;
      // Increase multiplier every 5 kills
      if (newCombo % 5 === 0) {
        setMultiplier((m) => Math.min(m + MULTIPLIER_INCREMENT, 3.0)); // Max 3x
      }
      return newCombo;
    });

    // Reset timeout
    if (comboTimeoutRef.current) {
      clearTimeout(comboTimeoutRef.current);
    }

    comboTimeoutRef.current = setTimeout(() => {
      reset();
    }, COMBO_TIMEOUT);
  }, [reset]);

  return { combo, multiplier, addKill, reset };
}

