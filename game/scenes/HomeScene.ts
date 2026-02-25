import Phaser from 'phaser';
import { Background } from '../objects/Background';
import { GAME_WIDTH, GAME_HEIGHT } from '../../constants';

export class HomeScene extends Phaser.Scene {
  declare cameras: Phaser.Cameras.Scene2D.CameraManager;
  declare scale: Phaser.Scale.ScaleManager;
  declare add: Phaser.GameObjects.GameObjectFactory;
  declare textures: Phaser.Textures.TextureManager;
  declare tweens: Phaser.Tweens.TweenManager;

  private background!: Background;
  private magicBookContainer!: Phaser.GameObjects.Container;
  private particles!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor() {
    super({ key: 'HomeScene' });
  }

  create() {
    // 1. Reuse the atmospheric background
    this.background = new Background(this);
    
    // 2. Create the "Magic Book" visual (Campfire vibe)
    // We position it higher (0.6) so it sits nicely above the bottom UI buttons
    this.createMagicBook();

    // 3. Create rising "Knowledge" particles (Sparkles/Runes)
    this.createMagicParticles();

    // 4. Subtle camera float
    this.cameras.main.setZoom(1.0);
  }

  update(time: number, delta: number) {
    // Scroll background very slowly for ambiance
    if (this.background) {
        this.background.update(time, delta, 20); // Very slow drift
    }
  }

  public startGameTransition(onComplete: () => void) {
      // Zoom into the book/fire
      const cy = this.scale.height * 0.65;
      this.cameras.main.pan(this.scale.width / 2, cy, 1000, 'Power2');
      this.cameras.main.zoomTo(4, 1000, 'Power2', true, (camera, progress) => {
          if (progress === 1) {
              onComplete();
          }
      });
  }

  private createMagicBook() {
      const cx = this.scale.width / 2;
      // Positioned at 65% height to be visible above the UI panel
      const cy = this.scale.height * 0.65; 

      this.magicBookContainer = this.add.container(cx, cy);

      // Generate Texture if needed
      if (!this.textures.exists('magic_book_glow')) {
          const canvas = this.textures.createCanvas('magic_book_glow', 256, 128);
          if (canvas) {
              const ctx = canvas.context;
              
              // Glow
              const grd = ctx.createRadialGradient(128, 64, 10, 128, 64, 100);
              grd.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
              grd.addColorStop(0.4, 'rgba(255, 100, 0, 0.4)');
              grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
              ctx.fillStyle = grd;
              ctx.fillRect(0,0,256,128);

              // Book Shape (Silhouette mostly)
              ctx.fillStyle = '#3e2723';
              ctx.beginPath();
              // Left Page
              ctx.moveTo(128, 80); 
              ctx.quadraticCurveTo(64, 90, 20, 70);
              ctx.lineTo(20, 80);
              ctx.quadraticCurveTo(64, 100, 128, 90);
              // Right Page
              ctx.moveTo(128, 80);
              ctx.quadraticCurveTo(192, 90, 236, 70);
              ctx.lineTo(236, 80);
              ctx.quadraticCurveTo(192, 100, 128, 90);
              ctx.fill();

              // Pages Light
              ctx.fillStyle = '#fff8e1';
              ctx.beginPath();
              // Left
              ctx.moveTo(128, 80); ctx.quadraticCurveTo(64, 90, 20, 70); ctx.lineTo(128, 75);
              // Right
              ctx.moveTo(128, 80); ctx.quadraticCurveTo(192, 90, 236, 70); ctx.lineTo(128, 75);
              ctx.fill();

              canvas.refresh();
          }
      }

      const book = this.add.image(0, 0, 'magic_book_glow');
      this.magicBookContainer.add(book);

      // Floating Animation
      this.tweens.add({
          targets: this.magicBookContainer,
          y: cy - 10,
          duration: 2000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
      });
      
      // Pulse Light
      this.tweens.add({
          targets: book,
          alpha: 0.8,
          scale: 1.05,
          duration: 1500,
          yoyo: true,
          repeat: -1
      });
  }

  private createMagicParticles() {
      // Texture for runes/sparkles
      if (!this.textures.exists('rune_particle')) {
          const canvas = this.textures.createCanvas('rune_particle', 32, 32);
          if (canvas) {
             const ctx = canvas.context;
             ctx.fillStyle = '#ffd700';
             ctx.font = '20px Arial';
             ctx.fillText('?', 10, 20); // Simple rune placeholder
             canvas.refresh();
          }
      }

      const cx = this.scale.width / 2;
      const cy = this.scale.height * 0.65; // Sync with book position

      this.particles = this.add.particles(0, 0, 'star_collectible', {
          x: cx,
          y: cy,
          speedY: { min: -100, max: -200 },
          speedX: { min: -50, max: 50 },
          scale: { start: 0.5, end: 0 },
          alpha: { start: 1, end: 0 },
          lifespan: 2000,
          frequency: 150,
          blendMode: 'ADD',
          rotate: { min: 0, max: 360 }
      });
  }
}