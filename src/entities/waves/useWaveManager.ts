// Hook for managing wave progression

import { useEffect, useRef, useState } from 'react';
import { WAVES } from './waveDefinitions';
import type { WaveConfig } from './waveTypes';
import { getPattern } from '../enemies/patterns';

interface UseWaveManagerProps {
  bounds: { width: number; height: number };
  onSpawnEnemy: (params: {
    kind: WaveConfig['enemies'][number]['kind'];
    pattern: WaveConfig['enemies'][number]['pattern'];
    baseSpeed: number;
    hpMultiplier: number;
    initialPosition?: { x: number; y: number };
    indexInFormation?: number;
  }) => void;
}

export function useWaveManager({ onSpawnEnemy, bounds }: UseWaveManagerProps) {
  const [currentWaveIndex, setCurrentWaveIndex] = useState(0);
  const [enemiesRemaining, setEnemiesRemaining] = useState(0);
  const [phase, setPhase] = useState<'between' | 'inWave'>('between');
  const spawnIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSpawnRef = useRef(onSpawnEnemy);
  useEffect(() => { onSpawnRef.current = onSpawnEnemy; }, [onSpawnEnemy]);

  const currentWave = WAVES[currentWaveIndex] ?? WAVES[WAVES.length - 1];

  useEffect(() => {
    if (!currentWave) return;

    // Between-wave announcer phase
    setPhase('between');

    // Count enemies in the upcoming wave
    const total = currentWave.enemies.reduce((acc, g) => acc + g.count, 0);
    setEnemiesRemaining(total);

    // Spawn entire wave after announcer timeout
    timerRef.current = setTimeout(() => {
      for (const group of currentWave.enemies) {
        const pat = getPattern(group.pattern as unknown as string);
        if (pat) {
          const positions = pat.initialPositions(group.count, bounds.width, bounds.height);
          positions.forEach((pos) => {
            onSpawnRef.current({
              kind: group.kind,
              pattern: group.pattern,
              baseSpeed: currentWave.baseSpeed,
              hpMultiplier: currentWave.hpMultiplier,
              initialPosition: { x: pos.x, y: pos.y },
              indexInFormation: pos.indexInFormation,
            });
          });
        } else {
          // Legacy patterns fallback (no formation)
          for (let i = 0; i < group.count; i++) {
            onSpawnRef.current({
              kind: group.kind,
              pattern: group.pattern,
              baseSpeed: currentWave.baseSpeed,
              hpMultiplier: currentWave.hpMultiplier,
            });
          }
        }
      }
      setPhase('inWave');
    }, 2000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentWaveIndex, bounds.width, bounds.height]);

  function decrementAndAdvance() {
    setEnemiesRemaining((prev) => {
      const next = prev - 1;
      if (next <= 0) {
        setPhase('between');
        setTimeout(() => {
          setCurrentWaveIndex((i) => i + 1); // next wave
        }, 2000);
      }
      return next;
    });
  }

  function onEnemyKilled() {
    decrementAndAdvance();
  }

  function onEnemyPassed() {
    // Enemy passed off-screen; decrement remaining and advance if none left
    decrementAndAdvance();
  }

  return {
    currentWave,
    enemiesRemaining,
    currentWaveId: currentWave?.id ?? 1,
    phase,
    onEnemyKilled,
    onEnemyPassed,
  };
}

export default useWaveManager;