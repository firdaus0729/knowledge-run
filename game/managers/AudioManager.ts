import Phaser from 'phaser';
import { MainScene } from '../scenes/MainScene';

const STORAGE_SOUND = 'soundEnabled';
const STORAGE_MUSIC = 'musicEnabled';

const SFX_VOLUME = 0.5;
const LONG_VOLUME = 0.4;

export interface AudioManagerOptions {
  soundEnabled?: boolean;
  musicEnabled?: boolean;
}

/**
 * Single-source audio: no overlapping long tracks. One-shot SFX only when specified.
 * - button.wav: any button press
 * - star.wav: get a star (once)
 * - jump.wav: jump (once)
 * - box.wav: puzzle solved correctly (once)
 * - damage.wav: puzzle wrong or hit obstacle (once)
 * - sandstorm.wav: from sandstorm start until sandstorm end (then stop)
 * - fail.wav: game over (once)
 * - magic-gate.mp3: 5 sec silence then play when reaching stage 1 gate
 * - stageSuccess.wav: each stage completed (once)
 */
export class AudioManager {
  private scene: MainScene;
  private _soundEnabled: boolean = true;
  private _musicEnabled: boolean = true;
  private sandstormSound: Phaser.Sound.WebAudioSound | null = null;
  private magicGateSound: Phaser.Sound.WebAudioSound | null = null;
  private flyingSound: Phaser.Sound.WebAudioSound | null = null;

  constructor(scene: MainScene, options: AudioManagerOptions = {}) {
    this.scene = scene;
    this._soundEnabled = options.soundEnabled ?? (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_SOUND) !== '0');
    this._musicEnabled = options.musicEnabled ?? (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_MUSIC) !== '0');
  }

  private playOneShot(key: string, volume: number = SFX_VOLUME): void {
    if (!this._soundEnabled) return;
    if (!this.scene.cache.audio.exists(key)) return;
    this.scene.sound.add(key).play({ volume });
  }

  /** Stop any long-playing/looping audio (sandstorm, magic-gate) so they never overlap. */
  stopAllLongAudio(): void {
    if (this.sandstormSound?.isPlaying) {
      this.sandstormSound.stop();
      this.sandstormSound = null;
    }
    if (this.magicGateSound?.isPlaying) {
      this.magicGateSound.stop();
      this.magicGateSound = null;
    }
    if (this.flyingSound?.isPlaying) {
      this.flyingSound.stop();
      this.flyingSound = null;
    }
  }

  /** Background music: always ensure only ONE global BGM instance is playing. */
  startBGM(): void {
    if (!this._musicEnabled) return;
    try {
      const bgm: any = (globalThis as any).__kr_bgm;
      // Stop then start so phase reset feels like a fresh run.
      bgm?.stop?.();
      void bgm?.start?.();
    } catch (_) {
      // Ignore – browser autoplay may block until first gesture, which already happened.
    }
  }

  pauseBGM(): void {
    try { (globalThis as any).__kr_bgm?.pause?.(); } catch (_) { /* ignore */ }
  }

  resumeBGM(): void {
    if (!this._musicEnabled) return;
    try { (globalThis as any).__kr_bgm?.resume?.(); } catch (_) { /* ignore */ }
  }

  stopBGM(): void {
    try { (globalThis as any).__kr_bgm?.stop?.(); } catch (_) { /* ignore */ }
  }

  /** Button pressed (pause, toggles, etc.). */
  playButton(): void {
    this.playOneShot('sfx_button');
  }

  /** Collected a star. */
  playStar(): void {
    this.playOneShot('sfx_star');
  }

  /** Player jumped. */
  playJump(): void {
    this.playOneShot('sfx_jump');
  }

  /** Puzzle solved correctly. */
  playPuzzleCorrect(): void {
    this.playOneShot('sfx_box');
  }

  /** Puzzle wrong or hit obstacle. */
  playDamage(): void {
    this.playOneShot('sfx_damage');
  }

  /** Game over (no lives left). */
  playFail(): void {
    this.playOneShot('sfx_fail');
  }

  /** Stage completed (desert or library). */
  playStageSuccess(): void {
    this.playOneShot('sfx_stageSuccess');
  }

  /** Start sandstorm: stop other long audio, play sandstorm.wav in loop until stopSandstorm(). */
  startSandstorm(): void {
    if (!this._soundEnabled) return;
    this.stopAllLongAudio();
    if (!this.scene.cache.audio.exists('sfx_sandstorm')) return;
    this.sandstormSound = this.scene.sound.add('sfx_sandstorm', {
      loop: true,
      volume: LONG_VOLUME
    }) as Phaser.Sound.WebAudioSound;
    this.sandstormSound.play();
  }

  /** Stop sandstorm audio when event ends. */
  stopSandstorm(): void {
    if (this.sandstormSound?.isPlaying) {
      this.sandstormSound.stop();
      this.sandstormSound = null;
    }
  }

  /** Start magic carpet flight: loop flying.wav until stopFlying(). */
  startFlying(): void {
    if (!this._soundEnabled) return;
    // Don't stop sandstorm here: sandstorm should own audio during sandstorm.
    if (this.sandstormSound?.isPlaying) return;
    if (this.flyingSound?.isPlaying) return;
    if (!this.scene.cache.audio.exists('sfx_flying')) return;
    this.flyingSound = this.scene.sound.add('sfx_flying', { loop: true, volume: LONG_VOLUME }) as Phaser.Sound.WebAudioSound;
    this.flyingSound.play();
  }

  /** Stop magic carpet flight audio when carpet ride ends. */
  stopFlying(): void {
    if (this.flyingSound?.isPlaying) {
      this.flyingSound.stop();
      this.flyingSound = null;
    }
  }

  /** At stage 1 magic gate: be silent 5 seconds, then play magic-gate.mp3 once. */
  playMagicGateAfterSilence(): void {
    if (!this._soundEnabled) return;
    this.stopAllLongAudio();
    if (!this.scene.cache.audio.exists('sfx_magicGate')) return;
    this.scene.time.delayedCall(2000, () => {
      if (!this.scene || !this.scene.sound) return;
      const snd = this.scene.sound.add('sfx_magicGate', { loop: false, volume: LONG_VOLUME }) as Phaser.Sound.WebAudioSound;
      this.magicGateSound = snd;
      snd.play();
    });
  }

  get soundEnabled(): boolean { return this._soundEnabled; }
  get musicEnabled(): boolean { return this._musicEnabled; }

  setSoundEnabled(value: boolean): void {
    this._soundEnabled = value;
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_SOUND, value ? '1' : '0');
  }

  setMusicEnabled(value: boolean): void {
    this._musicEnabled = value;
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_MUSIC, value ? '1' : '0');
    if (!value) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
  }
}
