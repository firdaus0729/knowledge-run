import Phaser from 'phaser';

export class Heart extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  declare scene: Phaser.Scene;
  declare x: number;
  declare y: number;
  declare setDepth: (value: number) => this;
  declare destroy: (fromScene?: boolean) => void;
  declare disableBody: (disableGameObject?: boolean, hideGameObject?: boolean) => this;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'heart_item');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(15);
    
    // Physics body
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setCircle(14, 2, 2); 

    // Heartbeat Animation
    scene.tweens.add({
      targets: this,
      scale: 1.15,
      duration: 600,
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

    // Particle Explosion
    if (this.scene.textures.exists('sparkle')) {
        const emitter = this.scene.add.particles(0, 0, 'sparkle', {
            x: this.x,
            y: this.y,
            speed: { min: 50, max: 150 },
            scale: { start: 1, end: 0 },
            lifespan: 600,
            quantity: 10,
            tint: 0xff0044, // Deep Red
            emitting: false
        });
        emitter.explode(10);
    }
    
    // Floating "+1" text
    const txt = this.scene.add.text(this.x, this.y, "❤", {
        fontSize: '32px',
        color: '#ff4d4d',
        stroke: '#fff',
        strokeThickness: 2
    }).setOrigin(0.5);

    this.scene.tweens.add({
        targets: txt,
        y: this.y - 50,
        alpha: 0,
        duration: 800,
        onComplete: () => txt.destroy()
    });

    this.destroy();
  }

  static generateTexture(scene: Phaser.Scene) {
    if (scene.textures.exists('heart_item')) return;
    
    const size = 32;
    const canvas = scene.textures.createCanvas('heart_item', size, size);
    if (!canvas) return;
    const ctx = canvas.context;
    
    const w = size;
    const h = size;

    // Gradient Fill
    const grd = ctx.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, '#ff6b81');
    grd.addColorStop(1, '#c0392b');
    ctx.fillStyle = grd;
    
    // Draw Plump Heart
    ctx.beginPath();
    const topCurveHeight = h * 0.3;
    ctx.moveTo(w / 2, h * 0.3);
    ctx.bezierCurveTo(w / 2, 0, 0, 0, 0, h * 0.3); // Left Top
    ctx.bezierCurveTo(0, h * 0.6, w / 2, h * 0.9, w / 2, h); // Left Bottom tip
    ctx.bezierCurveTo(w / 2, h * 0.9, w, h * 0.6, w, h * 0.3); // Right Bottom tip
    ctx.bezierCurveTo(w, 0, w / 2, 0, w / 2, h * 0.3); // Right Top
    ctx.fill();

    // Border
    ctx.strokeStyle = '#922B21'; // Dark red border
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Highlight (Gloss)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.ellipse(w * 0.25, h * 0.25, 3, 6, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    canvas.refresh();
  }
}