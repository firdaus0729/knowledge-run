import Phaser from 'phaser';
import { MainScene } from '../scenes/MainScene';

const STORAGE_SOUND = 'soundEnabled';
const STORAGE_MUSIC = 'musicEnabled';

/** BGM: BGM_01 = Main Runner (desert), BGM_02–06 = World variations (city uses BGM_02 for now). */
export type BGMStage = 'desert' | 'city';

/** Complete Sound Library – all SFX types per spec. */
export type SfxType =
  | 'jump'       // SFX_Jump 0.20
  | 'land'       // SFX_Land 0.20
  | 'starCollect'// SFX_StarCollect 0.25
  | 'eventAppear'// SFX_EventAppear 0.25
  | 'correctChoice'// SFX_CorrectChoice 0.30
  | 'wrongChoice' // SFX_WrongChoice 0.20
  | 'noorAppear' // SFX_NoorAppear 0.25
  | 'noorHelp'   // SFX_NoorHelp 0.30
  | 'buttonConfirm'// SFX_ButtonConfirm 0.25
  | 'objectActivate'// SFX_ObjectActivate 0.25 (doors, chests)
  | 'rewardMoment'// SFX_RewardMoment 0.30
  | 'levelComplete'// SFX_LevelComplete 0.30
  | 'storm'      // Sandstorm (soft) 0.20
  | 'pauseOpen'  // 0.20
  | 'pauseClose';// 0.20

const SFX_CONFIG: Record<SfxType, { key: string; volume: number }> = {
  jump:           { key: 'SFX_Jump', volume: 0.20 },
  land:           { key: 'SFX_Land', volume: 0.20 },
  starCollect:    { key: 'SFX_StarCollect', volume: 0.25 },
  eventAppear:    { key: 'SFX_EventAppear', volume: 0.25 },
  correctChoice:  { key: 'SFX_CorrectChoice', volume: 0.30 },
  wrongChoice:    { key: 'SFX_WrongChoice', volume: 0.20 },
  noorAppear:     { key: 'SFX_NoorAppear', volume: 0.25 },
  noorHelp:       { key: 'SFX_NoorHelp', volume: 0.30 },
  buttonConfirm:  { key: 'SFX_ButtonConfirm', volume: 0.25 },
  objectActivate: { key: 'SFX_ObjectActivate', volume: 0.25 },
  rewardMoment:   { key: 'SFX_RewardMoment', volume: 0.30 },
  levelComplete:  { key: 'SFX_LevelComplete', volume: 0.30 },
  storm:          { key: 'SFX_Storm', volume: 0.20 },
  pauseOpen:      { key: 'SFX_PauseOpen', volume: 0.20 },
  pauseClose:     { key: 'SFX_PauseClose', volume: 0.20 }
};

const BGM_KEYS: Record<BGMStage, string> = {
  desert: 'BGM_01',
  city: 'BGM_02'
};

const BGM_VOLUME_NORMAL = 0.22;
const BGM_VOLUME_DUCKED = 0.12;

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
  private lastLandSfx: number = 0;
  private readonly RATE_LIMIT_MS = 120;
  private bgmDuckTween: Phaser.Tweens.Tween | null = null;
  private isBGMDucked: boolean = false;

  constructor(scene: MainScene, options: AudioManagerOptions = {}) {
    this.scene = scene;
    this._soundEnabled = options.soundEnabled ?? (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_SOUND) !== '0');
    this._musicEnabled = options.musicEnabled ?? (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_MUSIC) !== '0');
    this.createBGMInstances();
  }

  private createBGMInstances() {
    (['BGM_01', 'BGM_02'] as const).forEach(key => {
      try {
        const sound = this.scene.sound.add(key, { loop: true, volume: BGM_VOLUME_NORMAL });
        this.bgmInstances.set(key, sound);
      } catch (_) { /* key may not be loaded */ }
    });
  }

  /** Play stage BGM; only switches when stage changes. Volume 0.20–0.25, seamless loop. */
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
            oldSound.volume = BGM_VOLUME_NORMAL;
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
      volume: this.isBGMDucked ? BGM_VOLUME_DUCKED : BGM_VOLUME_NORMAL,
      duration: 600,
      ease: 'Power2.Out'
    });
  }

  /** Slightly fade down BGM during events (choices, Noor, puzzle). */
  fadeBGMDown() {
    if (!this._musicEnabled || this.currentBGM === null) return;
    if (this.bgmDuckTween) this.bgmDuckTween.remove();
    const key = BGM_KEYS[this.currentBGM];
    const sound = this.bgmInstances.get(key) as Phaser.Sound.WebAudioSound | undefined;
    if (!sound || !sound.isPlaying) return;
    this.isBGMDucked = true;
    this.bgmDuckTween = this.scene.tweens.add({
      targets: sound,
      volume: BGM_VOLUME_DUCKED,
      duration: 350,
      ease: 'Power2.Out'
    });
  }

  /** Return BGM to normal level after event. */
  fadeBGMUp() {
    if (!this._musicEnabled || this.currentBGM === null) return;
    if (this.bgmDuckTween) this.bgmDuckTween.remove();
    const key = BGM_KEYS[this.currentBGM];
    const sound = this.bgmInstances.get(key) as Phaser.Sound.WebAudioSound | undefined;
    if (!sound || !sound.isPlaying) return;
    this.isBGMDucked = false;
    this.bgmDuckTween = this.scene.tweens.add({
      targets: sound,
      volume: BGM_VOLUME_NORMAL,
      duration: 500,
      ease: 'Power2.Out'
    });
  }

  stopMusic(clearCurrent = false) {
    if (this.bgmDuckTween) { this.bgmDuckTween.remove(); this.bgmDuckTween = null; }
    this.isBGMDucked = false;
    this.bgmInstances.forEach(s => {
      const snd = s as Phaser.Sound.WebAudioSound;
      if (snd.isPlaying) snd.stop();
    });
    if (clearCurrent) this.currentBGM = null;
  }

  playSfx(type: SfxType) {
    if (!this._soundEnabled) return;
    const cfg = SFX_CONFIG[type];
    if (!cfg || !this.scene.sound.get(cfg.key)) return;

    const now = this.scene.time.now;
    if (type === 'jump' && now - this.lastJumpSfx < this.RATE_LIMIT_MS) return;
    if (type === 'starCollect' && now - this.lastStarSfx < this.RATE_LIMIT_MS) return;
    if (type === 'land' && now - this.lastLandSfx < 150) return;
    if (type === 'jump') this.lastJumpSfx = now;
    if (type === 'starCollect') this.lastStarSfx = now;
    if (type === 'land') this.lastLandSfx = now;

    this.scene.sound.add(cfg.key).play({ volume: cfg.volume });
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
