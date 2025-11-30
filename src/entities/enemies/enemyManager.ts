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
      rogue: 65,
      boss: 150,
      armoredDrone: 80,
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
      // Initialize shootCooldown for armored drones, heavy, and boss
      shootCooldown: (kind === 'armoredDrone' || kind === 'heavy' || kind === 'boss') 
        ? (kind === 'boss' ? 1.0 + Math.random() * 0.5 : 1.5 + Math.random()) 
        : undefined,
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

    // Step 1: Update positions
    this.enemies = this.enemies.map(e => 
      updateEnemyPosition(e, this.bounds, dt, shipX, shipY)
    );
    
    // Step 2: Apply separation to prevent overlap
    this.separateEnemies();
    
    // Step 3: Clamp positions and remove off-screen enemies
    this.enemies = this.enemies.filter(e => {
      // Clamp horizontally based on sprite width (center-based coordinates)
      const half = e.width / 2;
      e.x = Math.max(half, Math.min(this.bounds.width - half, e.x));
      
      // Check if passed screen
      if (e.y > height + e.height * 1.2) {
        this.removeEnemy(e.id, "passed");
        return false;
      }
      
      return true;
    });
  }

  // Separate overlapping enemies to prevent visual stacking
  private separateEnemies() {
    const SEPARATION_DISTANCE = 10; // Extra buffer between enemies (pixels)
    const PUSH_STRENGTH = 0.4; // How much to push (0-1), lower = smoother

    // Check all enemy pairs
    for (let i = 0; i < this.enemies.length; i++) {
      for (let j = i + 1; j < this.enemies.length; j++) {
        const e1 = this.enemies[i];
        const e2 = this.enemies[j];
        
        const dx = e1.x - e2.x;
        const dy = e1.y - e2.y;
        const distance = Math.hypot(dx, dy);
        
        // Calculate minimum safe distance (half of each size + buffer)
        const minDistance = (e1.width + e2.width) / 2 + SEPARATION_DISTANCE;
        
        if (distance < minDistance && distance > 0) {
          // Calculate overlap amount
          const overlap = minDistance - distance;
          const pushX = (dx / distance) * overlap * PUSH_STRENGTH;
          const pushY = (dy / distance) * overlap * PUSH_STRENGTH;
          
          // Determine push weights based on enemy type
          let weight1 = 1.0;
          let weight2 = 1.0;
          
          // Boss doesn't get pushed (too heavy)
          if (e1.kind === 'boss') weight1 = 0;
          if (e2.kind === 'boss') weight2 = 0;
          
          // Heavy/armored enemies push lighter enemies more
          if (e1.kind === 'heavy' || e1.kind === 'armoredDrone') weight1 = 0.7;
          if (e2.kind === 'heavy' || e2.kind === 'armoredDrone') weight2 = 0.7;
          
          // V-formation tries to maintain position
          if (e1.pattern === 'vFormation') weight1 = 0.5;
          if (e2.pattern === 'vFormation') weight2 = 0.5;
          
          const totalWeight = weight1 + weight2;
          if (totalWeight > 0) {
            // Push enemies apart proportionally
            e1.x += pushX * (weight1 / totalWeight);
            e1.y += pushY * (weight1 / totalWeight);
            e2.x -= pushX * (weight2 / totalWeight);
            e2.y -= pushY * (weight2 / totalWeight);
          }
        }
      }
    }
  }
}
