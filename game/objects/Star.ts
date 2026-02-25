import Phaser from 'phaser';

export class Star extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  declare scene: Phaser.Scene;
  declare x: number;
  declare y: number;
  declare setDepth: (value: number) => this;
  declare destroy: (fromScene?: boolean) => void;
  declare disableBody: (disableGameObject?: boolean, hideGameObject?: boolean) => this;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'star_collectible');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(15);
    
    // Physics body
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    // Circular hitbox for forgiving collision
    body.setCircle(24, 8, 8); 

    // Hover Animation (Floating up and down)
    scene.tweens.add({
      targets: this,
      y: y - 15,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Gentle Rotation
    scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 8000,
      repeat: -1,
      ease: 'Linear'
    });
  }

  update(speed: number) {
    this.x -= speed;
    
    // Cleanup if off-screen
    if (this.x < -100) {
      this.destroy();
    }
  }

  collect() {
    this.disableBody(true, true); // Disable physics and hide texture

    // 1. Particle Explosion
    if (this.scene.textures.exists('sparkle')) {
        const emitter = this.scene.add.particles(0, 0, 'sparkle', {
            x: this.x,
            y: this.y,
            speed: { min: 50, max: 150 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.8, end: 0 },
            blendMode: 'ADD',
            lifespan: 600,
            quantity: 12,
            emitting: false
        });
        // Explode
        emitter.explode(12);
        
        // Auto-destroy emitter after animation
        this.scene.time.delayedCall(1000, () => emitter.destroy());
    }

    // 2. Visual "Ghost" scaling up (Echo effect)
    const ghost = this.scene.add.image(this.x, this.y, 'star_collectible');
    ghost.setTint(0xffffff);
    ghost.setAlpha(0.8);
    ghost.setBlendMode(Phaser.BlendModes.ADD);
    
    this.scene.tweens.add({
        targets: ghost,
        scale: 2,
        alpha: 0,
        rotation: 1,
        duration: 400,
        ease: 'Quad.out',
        onComplete: () => {
            ghost.destroy();
            this.destroy(); // Destroy the actual star object
        }
    });
  }

  static generateTexture(scene: Phaser.Scene) {
    // 1. Star Texture
    if (!scene.textures.exists('star_collectible')) {
      const size = 64;
      const canvas = scene.textures.createCanvas('star_collectible', size, size);
      if (canvas) {
        const ctx = canvas.context;
        const cx = size / 2;
        const cy = size / 2;

        // Soft Outer Glow
        const grd = ctx.createRadialGradient(cx, cy, 8, cx, cy, 32);
        grd.addColorStop(0, 'rgba(255, 223, 0, 0.8)');
        grd.addColorStop(0.5, 'rgba(255, 215, 0, 0.2)');
        grd.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, size, size);

        // Star Shape
        ctx.beginPath();
        const spikes = 5;
        const outerRadius = 16;
        const innerRadius = 8;
        let rot = Math.PI / 2 * 3;
        const step = Math.PI / spikes;
        let x = cx;
        let y = cy;

        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();

        // Fill with Gold Gradient
        const starGrad = ctx.createLinearGradient(0, cy - outerRadius, 0, cy + outerRadius);
        starGrad.addColorStop(0, '#fffacd'); // Lemon Chiffon top
        starGrad.addColorStop(1, '#ffd700'); // Gold bottom
        ctx.fillStyle = starGrad;
        ctx.fill();

        // White sheen
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(cx - 4, cy - 4, 3, 0, Math.PI * 2);
        ctx.fill();

        canvas.refresh();
      }
    }

    // 2. Sparkle Particle Texture
    if (!scene.textures.exists('sparkle')) {
        const pCanvas = scene.textures.createCanvas('sparkle', 16, 16);
        if (pCanvas) {
            const ctx = pCanvas.context;
            const cx = 8;
            const cy = 8;
            
            // Diamond shape sparkle
            ctx.fillStyle = '#ffffcc';
            ctx.beginPath();
            ctx.moveTo(cx, 0);
            ctx.quadraticCurveTo(cx + 1, cy - 1, 16, cy);
            ctx.quadraticCurveTo(cx + 1, cy + 1, cx, 16);
            ctx.quadraticCurveTo(cx - 1, cy + 1, 0, cy);
            ctx.quadraticCurveTo(cx - 1, cy - 1, cx, 0);
            ctx.fill();

            // Center hot spot
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(cx, cy, 2, 0, Math.PI*2);
            ctx.fill();
            
            pCanvas.refresh();
        }
    }
  }
}