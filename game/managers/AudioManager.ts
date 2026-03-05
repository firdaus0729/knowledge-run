import Phaser from 'phaser';
import { MainScene } from '../scenes/MainScene';

const STORAGE_SOUND = 'soundEnabled';
const STORAGE_MUSIC = 'musicEnabled';

export type BGMStage = 'desert' | 'city';
export type SfxType = 'jump' | 'star' | 'correct' | 'wrong' | 'storm' | 'gate' | 'stageComplete';

const SFX_KEYS: Record<SfxType, string> = {
  jump: 'sfx_jump',
  star: 'sfx_star',
  correct: 'sfx_correct',
  wrong: 'sfx_wrong',
  storm: 'sfx_storm',
  gate: 'portal_open',
  stageComplete: 'sfx_stageComplete'
};

const BGM_KEYS: Record<BGMStage, string> = {
  desert: 'bgm_desert',
  city: 'bgm_city'
};

export interface AudioManagerOptions {
  soundEnabled?: boolean;
  musicEnabled?: boolean;
}

export class AudioManager {
  private scene: MainScene;
  private currentBGM: BGMStage | null = null;
  private bgmInstances: Map<string, Phaser.Sound.BaseSound> = new Map();
  private _soundEnabled: boolean = true;
  private _musicEnabled: boolean = true;
  private lastJumpSfx: number = 0;
  private lastStarSfx: number = 0;
  private readonly RATE_LIMIT_MS = 100;

  constructor(scene: MainScene, options: AudioManagerOptions = {}) {
    this.scene = scene;
    this._soundEnabled = options.soundEnabled ?? (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_SOUND) !== '0');
    this._musicEnabled = options.musicEnabled ?? (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_MUSIC) !== '0');
    this.createBGMInstances();
  }

  private createBGMInstances() {
    (['bgm_desert', 'bgm_city'] as const).forEach(key => {
      try {
        const sound = this.scene.sound.add(key, { loop: true, volume: 0.35 });
        this.bgmInstances.set(key, sound);
      } catch (_) { /* key may not be loaded */ }
    });
  }

  /** Play stage BGM; only switches when stage changes (no random restarts). */
  playMusic(stage: BGMStage) {
    if (!this._musicEnabled) return;
    if (this.currentBGM === stage) return;
    const key = BGM_KEYS[stage];
    if (!this.scene.sound.get(key)) return;

    if (this.currentBGM !== null) {
      const oldKey = BGM_KEYS[this.currentBGM];
      const oldSound = this.bgmInstances.get(oldKey) as Phaser.Sound.WebAudioSound | undefined;
      if (oldSound && oldSound.isPlaying) {
        this.scene.tweens.add({
          targets: oldSound,
          volume: 0,
          duration: 400,
          ease: 'Power2.In',
          onComplete: () => {
            oldSound.stop();
            oldSound.volume = 0.35;
            this.startBGM(stage);
          }
        });
        return;
      }
    }
    this.startBGM(stage);
  }

  private startBGM(stage: BGMStage) {
    const key = BGM_KEYS[stage];
    let sound = this.bgmInstances.get(key) as Phaser.Sound.WebAudioSound | undefined;
    if (!sound) {
      sound = this.scene.sound.add(key, { loop: true, volume: 0 }) as Phaser.Sound.WebAudioSound;
      this.bgmInstances.set(key, sound);
    }
    this.currentBGM = stage;
    sound.volume = 0;
    sound.play();
    this.scene.tweens.add({
      targets: sound,
      volume: 0.35,
      duration: 600,
      ease: 'Power2.Out'
    });
  }

  stopMusic(clearCurrent = false) {
    this.bgmInstances.forEach(s => {
      const snd = s as Phaser.Sound.WebAudioSound;
      if (snd.isPlaying) snd.stop();
    });
    if (clearCurrent) this.currentBGM = null;
  }

  playSfx(type: SfxType) {
    if (!this._soundEnabled) return;
    const key = SFX_KEYS[type];
    if (!this.scene.sound.get(key)) return;

    const now = this.scene.time.now;
    if (type === 'jump' && now - this.lastJumpSfx < this.RATE_LIMIT_MS) return;
    if (type === 'star' && now - this.lastStarSfx < this.RATE_LIMIT_MS) return;
    if (type === 'jump') this.lastJumpSfx = now;
    if (type === 'star') this.lastStarSfx = now;

    const volume = type === 'gate' ? 0.6 : type === 'storm' ? 0.5 : 0.55;
    this.scene.sound.add(key).play({ volume });
  }

  get soundEnabled(): boolean { return this._soundEnabled; }
  get musicEnabled(): boolean { return this._musicEnabled; }

  setSoundEnabled(value: boolean) {
    this._soundEnabled = value;
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_SOUND, value ? '1' : '0');
  }

  setMusicEnabled(value: boolean) {
    this._musicEnabled = value;
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_MUSIC, value ? '1' : '0');
    if (!value) this.stopMusic(false);
    else if (this.currentBGM) this.startBGM(this.currentBGM);
  }
}
