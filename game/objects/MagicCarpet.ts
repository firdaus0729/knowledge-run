
import Phaser from 'phaser';

export class MagicCarpet extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  declare scene: Phaser.Scene;
  declare x: number;
  declare y: number;
  declare active: boolean;
  declare setDepth: (value: number) => this;
  declare destroy: (fromScene?: boolean) => void;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'magic_carpet_pickup');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(20);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setSize(100, 20); // Adjusted hitbox for new shape

    // Float Animation
    scene.tweens.add({
      targets: this,
      y: y - 20,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Wave Effect (Scale Y)
    scene.tweens.add({
        targets: this,
        scaleY: 0.95, // Subtle wave
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
  }

  update(speed: number) {
    this.x -= speed;
    if (this.x < -100) this.destroy();
  }

  static init(scene: Phaser.Scene) {
      if (scene.textures.exists('magic_carpet_pickup')) return;
      
      const W = 120;
      const H = 20; // Thin profile for side view
      const canvas = scene.textures.createCanvas('magic_carpet_pickup', W, H + 20); // Extra height for tassels
      if (!canvas) return;
      const ctx = canvas.context;

      // Center horizontally, leaving room for tassels
      const pad = 10;
      const carpetW = W - pad*2;
      const carpetH = 12; // Main thickness
      const carpetY = 5;

      // 1. Main Body (Crimson Red)
      ctx.fillStyle = '#b71c1c';
      ctx.beginPath();
      // Slight curve for "flying" look
      ctx.moveTo(pad, carpetY);
      ctx.quadraticCurveTo(W/2, carpetY + 5, W - pad, carpetY);
      ctx.lineTo(W - pad, carpetY + carpetH);
      ctx.quadraticCurveTo(W/2, carpetY + carpetH + 5, pad, carpetY + carpetH);
      ctx.closePath();
      ctx.fill();

      // 2. Gold Border
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 3. Central Pattern (Dark Blue Band)
      ctx.fillStyle = '#1a237e';
      ctx.beginPath();
      ctx.moveTo(pad + 10, carpetY + 3);
      ctx.quadraticCurveTo(W/2, carpetY + 8, W - pad - 10, carpetY + 3);
      ctx.lineTo(W - pad - 10, carpetY + carpetH - 3);
      ctx.quadraticCurveTo(W/2, carpetY + carpetH + 2, pad + 10, carpetY + carpetH - 3);
      ctx.fill();

      // 4. Medallion (Gold Center)
      ctx.fillStyle = '#ffca28';
      ctx.beginPath();
      ctx.arc(W/2, carpetY + carpetH/2 + 2, 4, 0, Math.PI*2);
      ctx.fill();

      // 5. Tassels (Hanging gold threads)
      ctx.fillStyle = '#ffd700';
      const tasselLen = 8;
      
      // Left Tassel
      ctx.fillRect(pad, carpetY + carpetH - 2, 2, tasselLen);
      ctx.beginPath(); ctx.arc(pad + 1, carpetY + carpetH + tasselLen, 2, 0, Math.PI*2); ctx.fill();
      
      // Right Tassel
      ctx.fillRect(W - pad - 2, carpetY + carpetH - 2, 2, tasselLen);
      ctx.beginPath(); ctx.arc(W - pad - 1, carpetY + carpetH + tasselLen, 2, 0, Math.PI*2); ctx.fill();

      // Extra corner tassels (front/back perspective hint)
      ctx.fillStyle = '#e65100'; // Darker gold/orange for "back" tassels
      ctx.fillRect(pad + 5, carpetY + carpetH - 4, 2, tasselLen - 2);
      ctx.fillRect(W - pad - 7, carpetY + carpetH - 4, 2, tasselLen - 2);

      canvas.refresh();
  }
}
