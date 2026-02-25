
import Phaser from 'phaser';

export class CityLamp extends Phaser.GameObjects.Container {
  declare add: (child: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]) => this;
  declare setDepth: (value: number) => this;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    const lamp = scene.add.sprite(0, 0, 'city_street_lamp');
    lamp.setOrigin(0.5, 1);

    const glow = scene.add.image(0, -110, 'city_lamp_glow'); // Local pos relative to container
    glow.setBlendMode(Phaser.BlendModes.ADD);
    glow.setAlpha(0.6);
    
    scene.tweens.add({
        targets: glow,
        alpha: 0.8,
        scale: 1.1,
        duration: 1500,
        yoyo: true,
        repeat: -1
    });

    this.add(lamp);
    this.add(glow);
    this.setDepth(9.6);
  }

  static generateTexture(scene: Phaser.Scene) {
      if (scene.textures.exists('city_street_lamp')) return;
      const W = 64, H = 160;
      const canvas = scene.textures.createCanvas('city_street_lamp', W, H);
      if (!canvas) return;
      const ctx = canvas.context;

      // Pole
      ctx.fillStyle = '#263238'; // Dark metal
      ctx.fillRect(30, 40, 4, 120);
      
      // Base
      ctx.beginPath();
      ctx.moveTo(20, 160); ctx.lineTo(44, 160); ctx.lineTo(34, 140); ctx.lineTo(30, 140);
      ctx.fill();

      // Decoration
      ctx.beginPath();
      ctx.arc(32, 60, 6, 0, Math.PI*2);
      ctx.fill();

      // Lamp Head
      ctx.fillStyle = '#102027';
      ctx.beginPath();
      ctx.moveTo(20, 10); ctx.lineTo(44, 10);
      ctx.lineTo(40, 40); ctx.lineTo(24, 40);
      ctx.fill();

      // Glass/Light
      ctx.fillStyle = '#ffecb3';
      ctx.fillRect(26, 15, 12, 20);
      
      canvas.refresh();

      // GLOW TEXTURE
      if (!scene.textures.exists('city_lamp_glow')) {
          const gCanvas = scene.textures.createCanvas('city_lamp_glow', 64, 64);
          if (gCanvas) {
            const gCtx = gCanvas.context;
            const grd = gCtx.createRadialGradient(32, 32, 5, 32, 32, 30);
            grd.addColorStop(0, 'rgba(255, 235, 59, 0.6)');
            grd.addColorStop(1, 'rgba(0,0,0,0)');
            gCtx.fillStyle = grd;
            gCtx.fillRect(0,0,64,64);
            gCanvas.refresh();
          }
      }
  }
}
