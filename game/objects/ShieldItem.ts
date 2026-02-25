import Phaser from 'phaser';

export class ShieldItem extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  declare scene: Phaser.Scene;
  declare x: number;
  declare y: number;
  declare setDepth: (value: number) => this;
  declare destroy: (fromScene?: boolean) => void;
  declare disableBody: (disableGameObject?: boolean, hideGameObject?: boolean) => this;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'shield_item');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(15);
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    // Adjusted hitbox for shield shape
    body.setSize(36, 40);
    body.setOffset(7, 5);

    // Float Animation
    scene.tweens.add({
      targets: this,
      y: y - 10,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Rocking Animation (instead of rotating 360 which looks weird for a non-circular shield)
    scene.tweens.add({
        targets: this,
        angle: { from: -10, to: 10 },
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
  }

  update(speed: number) {
    this.x -= speed;
    if (this.x < -100) this.destroy();
  }

  collect() {
    this.disableBody(true, true);

    if (this.scene.textures.exists('sparkle')) {
        const emitter = this.scene.add.particles(0, 0, 'sparkle', {
            x: this.x,
            y: this.y,
            speed: { min: 50, max: 150 },
            scale: { start: 1, end: 0 },
            lifespan: 600,
            quantity: 15,
            tint: 0x00d2ff, // Cyan particles
            emitting: false
        });
        emitter.explode(15);
    }
    
    this.destroy();
  }

  static generateTexture(scene: Phaser.Scene) {
    if (scene.textures.exists('shield_item')) return;
    
    const size = 50;
    const canvas = scene.textures.createCanvas('shield_item', size, size);
    if (!canvas) return;
    const ctx = canvas.context;
    
    const cx = size/2;
    const cy = size/2;

    // Draw Heater Shield Shape
    ctx.beginPath();
    ctx.moveTo(5, 5);
    ctx.lineTo(45, 5); // Top Edge
    ctx.quadraticCurveTo(45, 35, 25, 48); // Right curve to tip
    ctx.quadraticCurveTo(5, 35, 5, 5); // Left curve to top
    ctx.closePath();
    
    // Fill Gradient
    const grd = ctx.createLinearGradient(0, 0, size, size);
    grd.addColorStop(0, '#2980b9'); // Blue
    grd.addColorStop(0.5, '#3498db');
    grd.addColorStop(1, '#1f618d'); // Darker Blue
    ctx.fillStyle = grd;
    ctx.fill();

    // Metallic Border
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#f1c40f'; // Gold
    ctx.stroke();

    // Inner detail (Cross/Shine)
    ctx.beginPath();
    ctx.moveTo(cx, 10); ctx.lineTo(cx, 42); // Vertical
    ctx.moveTo(10, 18); ctx.lineTo(40, 18); // Horizontal
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Center Gem/Orb
    ctx.beginPath();
    ctx.arc(cx, 18, 5, 0, Math.PI*2);
    ctx.fillStyle = '#f1c40f';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();

    canvas.refresh();
  }
}