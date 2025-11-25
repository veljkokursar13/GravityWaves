// Hook for managing enemies state

import { useState, useEffect, useRef } from 'react';
import { Enemy, EnemyKind, MovementPattern } from './types';
import { createEnemy } from './enemyFactory';
import { updateEnemyPosition } from './movement';

interface UseEnemiesProps {
  bounds: { width: number; height: number };
  shipPosition?: { x: number; y: number };
  onEnemyPassed?: (id: string) => void;
}

interface SpawnEnemyConfig {
  kind: EnemyKind;
  pattern: MovementPattern;
  baseSpeed: number;
  hpMultiplier: number;
  initialPosition?: { x: number; y: number };
  indexInFormation?: number;
}

export function useEnemies({ bounds, shipPosition, onEnemyPassed }: UseEnemiesProps) {
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const lastTimeRef = useRef<number | null>(null);
  const shipPositionRef = useRef(shipPosition); // Use ref to avoid recreating animation loop
  const onEnemyPassedRef = useRef(onEnemyPassed); // Use ref to avoid recreating animation loop
  
  // Update refs without causing effect re-run
  useEffect(() => {
    shipPositionRef.current = shipPosition;
  }, [shipPosition]);
  
  useEffect(() => {
    onEnemyPassedRef.current = onEnemyPassed;
  }, [onEnemyPassed]);

  function spawnEnemy(config: SpawnEnemyConfig) {
    const x = config.initialPosition?.x ?? (Math.random() * (bounds.width - 80) + 40);
    const y = config.initialPosition?.y ?? -80;

    const enemy = createEnemy({
      kind: config.kind,
      pattern: config.pattern,
      x,
      y,
      baseSpeed: config.baseSpeed,
      hpMultiplier: config.hpMultiplier,
      indexInFormation: config.indexInFormation,
    });

    setEnemies((prev) => [...prev, enemy]);
  }

  function killEnemy(id: string) {
    setEnemies((prev) => prev.filter((e) => e.id !== id));
  }

  function damageEnemy(id: string, damage: number) {
    setEnemies((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const newHp = Math.max(0, e.hp - damage);
          return { ...e, hp: newHp };
        }
        return e;
      }).filter((e) => e.hp > 0)
    );
  }

  // Game loop for enemy movement
  useEffect(() => {
    let frameId: number;

    const loop = (time: number) => {
      if (lastTimeRef.current == null) {
        lastTimeRef.current = time;
      }
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      const passedIds: string[] = [];
      setEnemies((prev) => {
        const updated: Enemy[] = [];
        for (const e of prev) {
          const n = updateEnemyPosition(
            e, 
            bounds, 
            dt,
            shipPositionRef.current?.x,
            shipPositionRef.current?.y
          );
          
          // Direct check: enemy passed bottom of screen (raw position only)
          const enemyHeight = n.height ?? 50;
          if (n.y > bounds.height + enemyHeight) {
            passedIds.push(n.id);
            continue; // Remove enemy from array
          }
          
          updated.push(n);
        }
        return updated;
      });
      
      // Trigger callbacks for passed enemies
      if (passedIds.length && onEnemyPassedRef.current) {
        passedIds.forEach(onEnemyPassedRef.current);
      }

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(frameId);
  }, [bounds.width, bounds.height]); // Removed shipPosition from deps - use ref instead

  return {
    enemies,
    spawnEnemy,
    killEnemy,
    damageEnemy,
  };
}
