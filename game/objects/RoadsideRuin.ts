
import Phaser from 'phaser';

export class RoadsideRuin extends Phaser.GameObjects.Container {
  declare add: (child: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]) => this;
  declare setDepth: (value: number) => this;
  declare setScale: (x: number, y?: number) => this;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    const ruin = scene.add.sprite(0, 0, 'roadside_ruin');
    ruin.setOrigin(0.5, 1);
    
    // Vary the look
    if (Math.random() > 0.5) ruin.setFlipX(true);
    
    this.add(ruin);
    this.setDepth(9.1); // Slightly behind palms
    this.setScale(Phaser.Math.FloatBetween(0.8, 1.2));
  }

  static generateTexture(scene: Phaser.Scene) {
      if (scene.textures.exists('roadside_ruin')) return;
      const W = 150, H = 200;
      const canvas = scene.textures.createCanvas('roadside_ruin', W, H);
      if (!canvas) return;
      const ctx = canvas.context;

      // Color (Worn Sandstone)
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#5d4037');
      grad.addColorStop(1, '#3e2723');
      ctx.fillStyle = grad;

      // Base Block
      ctx.beginPath();
      ctx.moveTo(10, H);
      ctx.lineTo(20, H-120); // Left eroded side
      ctx.lineTo(10, H-150);
      ctx.lineTo(40, H-180); // Jagged top left
      ctx.lineTo(60, H-140);
      ctx.lineTo(80, H-180); // Arch remains
      ctx.lineTo(120, H-160);
      ctx.lineTo(140, H-100);
      ctx.lineTo(130, H);
      ctx.fill();

      // Inner Cutout (Arch hint)
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.moveTo(50, H);
      ctx.quadraticCurveTo(75, H-100, 100, H);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';

      // Cracks and Details
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(30, H-100); ctx.lineTo(40, H-50);
      ctx.moveTo(110, H-80); ctx.lineTo(100, H-40);
      ctx.stroke();

      canvas.refresh();
  }
}
