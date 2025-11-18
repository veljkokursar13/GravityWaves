// Hook for managing wave progression

import { useEffect, useRef, useState } from 'react';
import { WAVES } from './waveDefinitions';
import type { WaveConfig } from './waveTypes';

interface UseWaveManagerProps {
  onSpawnEnemy: (params: {
    kind: WaveConfig['enemies'][number]['kind'];
    pattern: WaveConfig['enemies'][number]['patterns'][number];
    baseSpeed: number;
    hpMultiplier: number;
  }) => void;
}

export function useWaveManager({ onSpawnEnemy }: UseWaveManagerProps) {
  const [currentWaveIndex, setCurrentWaveIndex] = useState(0);
  const [enemiesRemaining, setEnemiesRemaining] = useState(0);
  const spawnIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSpawnRef = useRef(onSpawnEnemy);
  const selectedPatternRef = useRef<WaveConfig['enemies'][number]['patterns'][number] | null>(null);
  useEffect(() => { onSpawnRef.current = onSpawnEnemy; }, [onSpawnEnemy]);

  const currentWave = WAVES[currentWaveIndex] ?? WAVES[WAVES.length - 1];

  useEffect(() => {
    if (!currentWave) return;

    // Prepare queue
    const queue = currentWave.enemies.flatMap((group) =>
      Array.from({ length: group.count }).map(() => group)
    );
    setEnemiesRemaining(queue.length);
    spawnIndexRef.current = 0;
    // Choose ONE pattern for the whole wave (no mixing)
    const patterns = currentWave.enemies[0]?.patterns ?? ['straight'];
    selectedPatternRef.current = patterns[Math.floor(Math.random() * patterns.length)];

    // Resilient spawn loop using recursive timeout
    function spawnNext() {
      const i = spawnIndexRef.current;
      if (i >= queue.length) return;
      const group = queue[i];
      onSpawnRef.current({
        kind: group.kind,
        pattern: selectedPatternRef.current ?? 'straight',
        baseSpeed: currentWave.baseSpeed,
        hpMultiplier: currentWave.hpMultiplier,
      });

      spawnIndexRef.current = i + 1;
      timerRef.current = setTimeout(spawnNext, currentWave.spawnInterval);
    }

    spawnNext();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentWaveIndex]);

  function decrementAndAdvance() {
    setEnemiesRemaining((prev) => {
      const next = prev - 1;
      if (next <= 0) {
        setTimeout(() => {
          setCurrentWaveIndex((i) => i + 1); // next wave
        }, 1200);
      }
      return next;
    });
  }

  function onEnemyKilled() {
    decrementAndAdvance();
  }

  function onEnemyPassed() {
    decrementAndAdvance();
  }

  return {
    currentWave,
    enemiesRemaining,
    onEnemyKilled,
    onEnemyPassed,
  };
}

export default useWaveManager;