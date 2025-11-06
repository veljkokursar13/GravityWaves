export type SoundId = string;
export type Source = number | string; // require(...) resolves to number; URLs are strings

export type Kind = 'music' | 'sfx';
export type PlayOpts = { volume?: number; loop?: boolean };
export type Volumes = { music: number; sfx: number };

export interface PlayerHandle {}
export interface IAudioBackend {
  createPlayer(source: Source, opts?: PlayOpts): Promise<PlayerHandle>;
  play(handle: PlayerHandle): Promise<void>;
  pause(handle: PlayerHandle): Promise<void>;
  stop(handle: PlayerHandle): Promise<void>;
  setVolume(handle: PlayerHandle, volume: number): Promise<void>;
  unload(handle: PlayerHandle): Promise<void>;
}

export class AudioManager {
  private backend: IAudioBackend;
  private music?: PlayerHandle;
  private sfxPools = new Map<SoundId, PlayerHandle[]>();
  private registry = new Map<SoundId, { source: Source; kind: Kind }>();
  private volumes: Volumes = { music: 0.8, sfx: 1.0 };
  private muted = false;
  private sfxPoolSize = 4;

  constructor(backend: IAudioBackend, sfxPoolSize = 4) {
    this.backend = backend;
    this.sfxPoolSize = sfxPoolSize;
  }

  getState() {
    return { volumes: this.volumes, muted: this.muted };
  }

  async preload(items: Array<{ id: SoundId; source: Source; kind: Kind }>) {
    for (const it of items) this.registry.set(it.id, { source: it.source, kind: it.kind });
  }

  async playBgm(id: SoundId, opts: PlayOpts = { loop: true }) {
    return this.playMusic(id, opts);
  }

  async playMusic(id: SoundId, opts: PlayOpts = { loop: true }) {
    const meta = this.registry.get(id);
    if (!meta || meta.kind !== 'music') {
      console.warn('[audio] unknown music id:', id);
      return;
    }
    if (this.music) await this.backend.stop(this.music).catch(() => {});
    this.music = await this.backend.createPlayer(meta.source, {
      loop: opts.loop ?? true,
      volume: this.muted ? 0 : opts.volume ?? this.volumes.music,
    });
    await this.backend.play(this.music);
  }

  async stopMusic() {
    if (!this.music) return;
    await this.backend.stop(this.music).catch(() => {});
    await this.backend.unload(this.music).catch(() => {});
    this.music = undefined;
  }

  async playSfx(id: SoundId, opts: PlayOpts = {}) {
    const meta = this.registry.get(id);
    if (!meta || meta.kind !== 'sfx') {
      console.warn('[audio] unknown sfx id:', id);
      return;
    }
    let pool = this.sfxPools.get(id);
    if (!pool) {
      pool = [];
      this.sfxPools.set(id, pool);
    }
    let handle = pool.find(Boolean);
    if (!handle || pool.length < this.sfxPoolSize) {
      handle = await this.backend.createPlayer(meta.source, { loop: false });
      pool.push(handle);
    }
    await this.backend.setVolume(handle, this.muted ? 0 : opts.volume ?? this.volumes.sfx);
    await this.backend.stop(handle).catch(() => {});
    await this.backend.play(handle);
  }

  async setVolumes(v: Partial<Volumes>) {
    this.volumes = { ...this.volumes, ...v };
    if (this.music) await this.backend.setVolume(this.music, this.muted ? 0 : this.volumes.music);
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.music) this.backend.setVolume(this.music, this.muted ? 0 : this.volumes.music).catch(() => {});
  }

  async dispose() {
    if (this.music) await this.stopMusic();
    for (const pool of this.sfxPools.values()) {
      await Promise.all(pool.map(h => this.backend.unload(h).catch(() => {})));
    }
    this.sfxPools.clear();
  }
}


