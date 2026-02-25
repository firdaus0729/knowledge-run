
import Phaser from 'phaser';

export class StreetCat extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  declare scene: Phaser.Scene;
  declare x: number;
  declare y: number;
  declare setDepth: (value: number) => this;
  declare setOrigin: (x?: number, y?: number) => this;
  declare destroy: (fromScene?: boolean) => void;
  declare setFlipX: (value: boolean) => this;
  declare setVelocityY: (y: number) => this;
  
  private hasFled: boolean = false;
  private startX: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'street_cat'); // We will generate texture dynamically if missing
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.startX = x;
    this.setDepth(18); // Behind obstacles
    this.setOrigin(0.5, 1);
    
    // Physics
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(true);
    body.setImmovable(false); // It moves
    body.setSize(30, 20);
    
    // Idle animation (Tail wag)
    this.scene.tweens.add({
        targets: this,
        scaleY: 0.95,
        duration: 500,
        yoyo: true,
        repeat: -1
    });
  }

  update(playerX: number, speed: number) {
      if (!this.hasFled) {
          // Move with world
          this.x -= speed;
          
          // Check player distance (Run away trigger)
          if (this.x - playerX < 200) {
              this.flee();
          }
      } else {
          // Running away logic (move right relative to scroll)
          this.x += 2; // Run speed
          this.x -= speed; // Adjust for camera scroll
      }

      if (this.x < -100) this.destroy();
  }

  private flee() {
      this.hasFled = true;
      this.setFlipX(true); // Face away
      this.setVelocityY(-150); // Little hop start
      
      // Flee Tween
      this.scene.tweens.add({
          targets: this,
          scaleX: 1.2,
          scaleY: 0.8,
          duration: 100,
          yoyo: true,
          repeat: -1
      });
  }

  static generateTexture(scene: Phaser.Scene) {
      if (scene.textures.exists('street_cat')) return;
      
      const canvas = scene.textures.createCanvas('street_cat', 32, 24);
      if(!canvas) return;
      const ctx = canvas.context;
      
      // Cat Body
      ctx.fillStyle = '#e0e0e0'; // White/Grey cat
      ctx.beginPath();
      ctx.ellipse(16, 14, 10, 6, 0, 0, Math.PI*2);
      ctx.fill();
      
      // Head
      ctx.beginPath();
      ctx.arc(8, 10, 6, 0, Math.PI*2);
      ctx.fill();
      
      // Ears
      ctx.beginPath(); ctx.moveTo(4, 6); ctx.lineTo(2, 2); ctx.lineTo(7, 5); ctx.fill();
      ctx.beginPath(); ctx.moveTo(12, 6); ctx.lineTo(14, 2); ctx.lineTo(9, 5); ctx.fill();
      
      // Tail
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(26, 14);
      ctx.quadraticCurveTo(30, 10, 28, 4);
      ctx.stroke();

      canvas.refresh();
  }
}