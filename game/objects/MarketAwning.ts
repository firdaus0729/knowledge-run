
import Phaser from 'phaser';

export type AwningType = 'RED' | 'GREEN' | 'BLUE';

export class MarketAwning extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  declare scene: Phaser.Scene;
  declare x: number;
  declare y: number;
  declare scaleX: number;
  declare scaleY: number;
  declare setDepth: (value: number) => this;
  declare setOrigin: (x?: number, y?: number) => this;
  declare destroy: (fromScene?: boolean) => void;

  private awningType: AwningType;
  private bounceForce: number;
  private isBouncing: boolean = false; 

  constructor(scene: Phaser.Scene, x: number, y: number, type: AwningType = 'RED') {
    const key = `market_awning_${type.toLowerCase()}`;
    super(scene, x, y, key);
    
    this.awningType = type;
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(19); 
    this.setOrigin(0.5, 0.5); 

    // Physics Setup
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    
    // INCREASED HITBOX: Full width (100) and thinner height (30) so it's a platform, not a wall
    body.setSize(100, 30); 
    body.setOffset(0, 0); 

    body.checkCollision.down = false;
    body.checkCollision.left = false;
    body.checkCollision.right = false;
    body.checkCollision.up = true;

    // Bounce Logic based on Type
    if (this.awningType === 'BLUE') {
        // Reduced from 1350 to prevents hitting the ceiling (World Bounds)
        this.bounceForce = 1100; 
    } else {
        // Reduced from 950 for a controlled hop
        this.bounceForce = 850;  
    }
  }

  update(speed: number) {
    this.x -= speed;
    if (this.x < -200) {
      this.destroy();
    }
  }

  public triggerBounce() {
      if (this.isBouncing) return;
      this.isBouncing = true;

      // Visual Feedback: Squash and Stretch
      this.scene.tweens.add({
          targets: this,
          scaleY: 0.6, 
          scaleX: 1.1, 
          y: this.y + 10, 
          duration: 80,
          yoyo: true,
          ease: 'Sine.easeInOut',
          onComplete: () => {
              this.scaleX = 1;
              this.scaleY = 1;
          }
      });

      // Particles based on Type
      const texture = this.awningType === 'BLUE' ? 'sparkle' : 'dust_particle'; // Gold sparkles for Royal
      const tint = this.awningType === 'BLUE' ? 0xffd700 : 0xffffff;
      
      if (this.scene.textures.exists(texture)) {
          const emitter = this.scene.add.particles(0, 0, texture, {
              x: this.x,
              y: this.y,
              speed: { min: 40, max: 100 },
              angle: { min: 200, max: 340 },
              scale: { start: 0.6, end: 0 },
              alpha: { start: 0.8, end: 0 },
              lifespan: 700,
              quantity: 8,
              tint: tint,
              blendMode: this.awningType === 'BLUE' ? 'ADD' : 'NORMAL',
              emitting: false
          });
          emitter.explode(8);
          this.scene.time.delayedCall(1000, () => emitter.destroy());
      }
      
      // Reset bounce flag
      this.scene.time.delayedCall(500, () => {
          this.isBouncing = false;
      });
  }

  public getBounceForce(): number {
      return this.bounceForce;
  }

  static generateTextures(scene: Phaser.Scene) {
    // Generate 3 variants
    this.createVariant(scene, 'market_awning_red', '#d32f2f', '#ffcdd2', false);
    this.createVariant(scene, 'market_awning_green', '#2e7d32', '#c8e6c9', false);
    this.createVariant(scene, 'market_awning_blue', '#1565c0', '#ffd700', true); // Royal: Blue & Gold
  }

  private static createVariant(scene: Phaser.Scene, key: string, cPrimary: string, cSecondary: string, isRoyal: boolean) {
    if (scene.textures.exists(key)) return;

    const W = 100;
    const H = 55; // Reduced from 70 to make it look less heavy
    const canvas = scene.textures.createCanvas(key, W, H);
    if (!canvas) return;
    const ctx = canvas.context;

    // --- 1. Bracket ---
    ctx.fillStyle = '#3e2723'; 
    ctx.fillRect(0, 0, 10, 45); // Reduced bracket length
    ctx.fillRect(0, 10, W, 8); 
    
    ctx.strokeStyle = '#2d2d2d';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(5, 35); // Adjusted angle point
    ctx.lineTo(W-20, 15); 
    ctx.stroke();

    ctx.fillStyle = '#aaa';
    ctx.beginPath(); ctx.arc(5, 5, 2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(5, 40, 2, 0, Math.PI*2); ctx.fill();

    // --- 2. Canvas Body ---
    const stripeW = 18;
    
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(5, 10); 
    ctx.lineTo(W, 10); 
    ctx.lineTo(W-5, 35); // Shorter drape
    ctx.lineTo(5, 35); 
    ctx.closePath();
    ctx.clip(); 

    // Background fill
    ctx.fillStyle = cSecondary;
    ctx.fillRect(0, 0, W, H);

    // Stripes or Royal Pattern
    if (isRoyal) {
        // Gold Borders on Blue
        ctx.fillStyle = cPrimary; // Blue
        ctx.fillRect(0, 0, W, H);
        
        ctx.fillStyle = cSecondary; // Gold
        // Central thick stripe
        ctx.fillRect(40, 0, 20, H);
        // Side stripes
        ctx.fillRect(10, 0, 5, H);
        ctx.fillRect(85, 0, 5, H);
    } else {
        // Standard Stripes
        for(let x = 0; x < W; x += stripeW) {
            ctx.fillStyle = (x / stripeW) % 2 === 0 ? cPrimary : cSecondary;
            ctx.fillRect(x, 0, stripeW, H);
        }
    }

    // Shadow Gradient
    const shadow = ctx.createLinearGradient(0, 10, 0, 50);
    shadow.addColorStop(0, 'rgba(0,0,0,0.0)');
    shadow.addColorStop(1, 'rgba(0,0,0,0.2)');
    ctx.fillStyle = shadow;
    ctx.fillRect(0, 0, W, H);

    ctx.restore();

    // --- 3. Scallops ---
    const scallY = 35; // Moved up
    const scallH = 12;
    const scallops = 5;
    const scallW = (W-10) / scallops;

    for(let i=0; i<scallops; i++) {
        const sx = 5 + (i * scallW);
        if (isRoyal) {
            ctx.fillStyle = cSecondary; // All Gold scallops for Royal
        } else {
            ctx.fillStyle = (i % 2 === 0) ? cPrimary : cSecondary; 
        }
        
        ctx.beginPath();
        ctx.moveTo(sx, scallY);
        ctx.bezierCurveTo(sx, scallY + scallH, sx + scallW, scallY + scallH, sx + scallW, scallY);
        ctx.fill();
    }

    canvas.refresh();
  }
}
