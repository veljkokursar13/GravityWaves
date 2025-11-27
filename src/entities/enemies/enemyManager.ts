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
    };

    const hpBase = {
      drone: 1,
      heavy: 3,
      kamikaze: 1,
      rogue: 2,
      boss: 20,
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
      this.enemies[i] = updated;

      if (updated.y > height + updated.height * 1.2) {
        this.removeEnemy(updated.id, "passed");
      }
    }
  }
}
