// waveManager.ts
type WaveConfig = {
  id: number;
  baseSpeed: number;
  hpMultiplier: number;
  enemies: { kind: string; pattern: string; count: number }[];
};

type SpawnConfig = {
  kind: string;
  pattern: string;
  speed: number;
  hpMultiplier: number;
  initialPosition: { x?: number; y?: number; indexInFormation?: number } | null;
};

export class WaveManager {
  waves: WaveConfig[];
  current = 0;
  remaining = 0;
  phase: "between" | "inWave" = "between";
  spawnCallback: (cfg: SpawnConfig) => void;
  onBetween?: (info: { wave: number; untilMs: number }) => void;

  constructor(
    waves: WaveConfig[],
    spawnCallback: (cfg: SpawnConfig) => void,
    onBetween?: (info: { wave: number; untilMs: number }) => void
  ) {
    this.waves = Array.isArray(waves) ? waves : [];
    this.spawnCallback = spawnCallback;
    this.onBetween = onBetween;
  }

  startWave() {
    const wave = Array.isArray(this.waves) ? this.waves[this.current] : undefined;
    if (!wave || !Array.isArray(wave.enemies)) return;

    this.phase = "between";
    this.remaining = wave.enemies.reduce((a: number, e: { count: number }) => a + (e?.count ?? 0), 0);

    const spawnDelayMs = 2000;
    const announceMs = Math.max(0, Math.min(1500, spawnDelayMs - 250));
    this.onBetween?.({ wave: this.current + 1, untilMs: announceMs });

    setTimeout(() => {
      this.phase = "inWave";

      if (!Array.isArray(wave.enemies)) return;
      wave.enemies.forEach((group: { kind: string; pattern: string; count: number } | undefined) => {
        if (!group || typeof group.count !== 'number') return;
        
        // Stagger spawn timing per enemy (150ms apart)
        for (let i = 0; i < group.count; i++) {
          setTimeout(() => {
            this.spawnCallback?.({
              kind: group.kind,
              pattern: group.pattern,
              speed: wave.baseSpeed,
              hpMultiplier: wave.hpMultiplier,
              initialPosition: group.pattern === 'vFormation'
                ? { indexInFormation: i - Math.floor((group.count - 1) / 2) }
                : null,
            });
          }, i * 150); // 150ms stagger - looks amazing!
        }
      });
    }, spawnDelayMs);
  }

  enemyRemoved() {
    this.remaining--;

    if (this.remaining <= 0) {
      this.phase = "between";
      setTimeout(() => {
        this.current = Math.min(this.current + 1, this.waves.length - 1);
        this.startWave();
      }, 1500);
    }
  }
}
