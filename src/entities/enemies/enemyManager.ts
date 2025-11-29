// enemyManager.ts
import { Enemy, EnemyKind, MovementPattern } from "@/entities/enemies/types";
import { updateEnemyPosition } from "@/entities/enemies/movement";

export class EnemyManager {
  enemies: Enemy[] = [];
  bounds: { width: number; height: number };
  onRemove: (enemy: Enemy, cause: "killed" | "passed") => void;

  constructor(bounds: { width: number; height: number }, onRemove: (enemy: Enemy, cause: "killed" | "passed") => void) {
    this.bounds = bounds;
    this.onRemove = onRemove;
  }

  spawn(config: {
    kind: EnemyKind;
    pattern: MovementPattern;
    speed: number;
    hpMultiplier: number;
    initialPosition: { x?: number; y?: number; indexInFormation?: number } | null;
  }) {
    const { kind, pattern, speed, hpMultiplier, initialPosition } = config;

    const SIZES = {
      drone: 45,
      heavy: 60,
      kamikaze: 40,
      rogue: 50,
      boss: 100,
      armoredDrone: 55,
    };

    const hpBase = {
      drone: 1,
      heavy: 3,
      kamikaze: 1,
      rogue: 2,
      boss: 20,
      armoredDrone: 5,
    };

    const id = `${kind}-${Math.random().toString(36).slice(2, 8)}`;
    const size = SIZES[kind];
    const hp = Math.ceil(hpBase[kind] * hpMultiplier);

    let x: number;
    let y: number;
    if (pattern === 'vFormation') {
      const k = initialPosition?.indexInFormation ?? 0; // centered around 0
      const spread = size * 1.1;
      x = this.bounds.width * 0.5 + k * spread;
      y = -80 - Math.abs(k) * 20; // outer ships start slightly higher
    } else {
      // Random lanes for other patterns
      x = initialPosition?.x ?? (this.bounds.width * 0.1 + Math.random() * this.bounds.width * 0.8);
      y = initialPosition?.y ?? -80;
    }

    // Clamp spawn X so sprite width stays fully on-screen (center-based coordinates)
    {
      const half = size / 2;
      x = Math.max(half, Math.min(this.bounds.width - half, x));
    }

    this.enemies.push({
      id,
      kind,
      pattern,
      x,
      y,
      spawnX: x,
      spawnY: y,
      width: size,
      height: size,
      speed,
      hp,
      maxHp: hp,
      t: 0,
      rotation: 0,
      direction: Math.random() < 0.5 ? 1 : -1,
      indexInFormation: initialPosition?.indexInFormation,
    });
  }

  damage(id: string, amount: number) {
    const e = this.enemies.find((x) => x.id === id);
    if (!e) return;

    e.hp -= amount;
    if (e.hp <= 0) {
      this.removeEnemy(id, "killed");
    }
  }

  removeEnemy(id: string, cause: "killed" | "passed") {
    const enemy = this.enemies.find((e) => e.id === id);
    if (enemy) this.onRemove(enemy, cause);

    this.enemies = this.enemies.filter((e) => e.id !== id);
  }

  update(dt: number, shipX: number, shipY: number) {
    const { height } = this.bounds;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];

      const updated = updateEnemyPosition(e, this.bounds, dt, shipX, shipY);
      // Clamp horizontally based on sprite width (center-based coordinates)
      {
        const half = updated.width / 2;
        if (updated.x < half) updated.x = half;
        if (updated.x > this.bounds.width - half) updated.x = this.bounds.width - half;
      }
      this.enemies[i] = updated;

      if (updated.y > height + updated.height * 1.2) {
        this.removeEnemy(updated.id, "passed");
      }
    }

    // Horizontal separation pass to avoid enemy overlaps
    // - Prefers moving non-formation enemies when colliding with vFormation
    // - Keeps movements minimal and re-clamps to width after shifts
    for (let a = 0; a < this.enemies.length; a++) {
      for (let b = a + 1; b < this.enemies.length; b++) {
        const A = this.enemies[a];
        const B = this.enemies[b];
        const dx = Math.abs(A.x - B.x);
        const dy = Math.abs(A.y - B.y);
        const overlapX = (A.width + B.width) / 2 - dx;
        const overlapY = (A.height + B.height) / 2 - dy;
        if (overlapX > 0 && overlapY > 0) {
          // Decide how to push: prefer moving non-formation enemy if possible
          let pushA = 0, pushB = 0;
          if (A.pattern === 'vFormation' && B.pattern !== 'vFormation') {
            pushB = (A.x < B.x ? 1 : -1) * overlapX;
          } else if (B.pattern === 'vFormation' && A.pattern !== 'vFormation') {
            pushA = (B.x < A.x ? 1 : -1) * overlapX;
          } else {
            const dir = A.x <= B.x ? -1 : 1;
            const halfPush = overlapX / 2;
            pushA = dir * halfPush;
            pushB = -dir * halfPush;
          }
          if (pushA !== 0) {
            const halfA = A.width / 2;
            A.x = Math.max(halfA, Math.min(this.bounds.width - halfA, A.x + pushA));
          }
          if (pushB !== 0) {
            const halfB = B.width / 2;
            B.x = Math.max(halfB, Math.min(this.bounds.width - halfB, B.x + pushB));
          }
        }
      }
    }
  }
}
