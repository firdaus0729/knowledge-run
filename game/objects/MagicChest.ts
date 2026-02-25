import Phaser from 'phaser';

export type ChestType = 'box' | 'chest';

export class MagicChest extends Phaser.GameObjects.Container {
  declare scene: Phaser.Scene;
  declare x: number;
  declare y: number;
  declare add: (child: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]) => this;
  declare setDepth: (value: number) => this;
  declare destroy: (fromScene?: boolean) => void;
  declare active: boolean;

  private chestType: ChestType;
  private bodySprite!: Phaser.GameObjects.Sprite;
  private lidSprite!: Phaser.GameObjects.Sprite;
  private glow!: Phaser.GameObjects.Image;
  private isOpen: boolean = false;
  private idleParticles!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene, x: number, y: number, isGrounded: boolean = false) {
    super(scene, x, y);
    scene.add.existing(this);
    
    // Randomize type
    this.chestType = Math.random() > 0.5 ? 'chest' : 'box';

    this.generateTextures();
    this.createVisuals();
    this.setDepth(25); // Same depth layer as gates
    
    // Float animation (Only if not grounded)
    if (!isGrounded) {
        this.scene.tweens.add({
            targets: this,
            y: y - 15,
            duration: 2500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
  }

  private createVisuals() {
    // 1. Glow Behind
    this.glow = this.scene.add.image(0, -30, 'chest_glow');
    this.glow.setBlendMode(Phaser.BlendModes.ADD);
    this.glow.setAlpha(0.5);
    this.glow.setScale(0.8);
    this.add(this.glow);

    this.scene.tweens.add({
        targets: this.glow,
        alpha: 0.8,
        scale: 1.1,
        rotation: 0.2,
        duration: 3000,
        yoyo: true,
        repeat: -1
    });

    // 2. Base Body
    const bodyKey = this.chestType === 'chest' ? 'chest_body' : 'box_body';
    this.bodySprite = this.scene.add.sprite(0, 0, bodyKey);
    this.add(this.bodySprite);

    // 3. Lid (Positioned relative to body top)
    const lidKey = this.chestType === 'chest' ? 'chest_lid' : 'box_lid';
    // Chest lid hinges at back (-20), Box lid sits on top (-25)
    const lidY = this.chestType === 'chest' ? -20 : -25;
    this.lidSprite = this.scene.add.sprite(0, lidY, lidKey);
    this.add(this.lidSprite);

    // 4. Idle Particles (Sparkles)
    if (this.scene.textures.exists('sparkle')) {
        this.idleParticles = this.scene.add.particles(0, 0, 'sparkle', {
            x: 0, 
            y: 0,
            scale: { start: 0.5, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 1000,
            frequency: 300,
            speed: 20,
            quantity: 1,
            blendMode: 'ADD',
            emitting: true
        });
        this.add(this.idleParticles);
    }
  }

  public open(onComplete: () => void) {
      if (this.isOpen) return;
      this.isOpen = true;

      // Stop idle movement
      this.scene.tweens.killTweensOf(this);

      // Anticipation "Jump"
      this.scene.tweens.add({
          targets: [this.bodySprite, this.lidSprite],
          scaleX: 1.2,
          scaleY: 0.8,
          duration: 100,
          yoyo: true,
          onComplete: () => {
              this.playOpenAnimation(onComplete);
          }
      });
  }

  private playOpenAnimation(onComplete: () => void) {
      // Animation based on type
      if (this.chestType === 'chest') {
          // Arc open with bounce
          this.scene.tweens.add({
              targets: this.lidSprite,
              y: '-=20',
              angle: -100,
              duration: 600,
              ease: 'Back.out'
          });
      } else {
          // Pop off and spin
          this.scene.tweens.add({
              targets: this.lidSprite,
              y: '-=100',
              angle: 180,
              alpha: 0,
              duration: 800,
              ease: 'Quad.out'
          });
      }

      // Burst of stars
      if (this.scene.textures.exists('star_collectible')) {
          const emitter = this.scene.add.particles(0, 0, 'star_collectible', {
              x: 0, 
              y: -20,
              speed: { min: 150, max: 350 },
              angle: { min: 200, max: 340 },
              scale: { start: 0.6, end: 0 },
              lifespan: 1500,
              quantity: 20,
              emitting: false
          });
          this.add(emitter);
          emitter.explode(20);
      }
      
      // Light burst
      this.scene.tweens.add({
          targets: this.glow,
          scale: 3,
          alpha: 0,
          duration: 600
      });

      this.scene.time.delayedCall(800, onComplete);
  }

  update(speed: number) {
      this.x -= speed;
      if (this.x < -300) {
          this.destroy();
      }
  }

  private generateTextures() {
      // Helper to get context
      const getCtx = (name: string, w: number, h: number) => {
          if (this.scene.textures.exists(name)) {
              this.scene.textures.remove(name);
          }
          return this.scene.textures.createCanvas(name, w, h)?.context;
      };

      // --- TREASURE CHEST (Detailed Wood & Gold) ---
      const cb = getCtx('chest_body', 70, 44);
      if (cb) {
          // Dark Wood Base
          cb.fillStyle = '#4e342e';
          cb.fillRect(0, 0, 70, 44);
          // Wood Planks
          cb.fillStyle = '#3e2723';
          for(let i=10; i<70; i+=14) cb.fillRect(i, 0, 2, 44);
          // Shading
          const grd = cb.createLinearGradient(0,0,0,44);
          grd.addColorStop(0, 'rgba(0,0,0,0)');
          grd.addColorStop(1, 'rgba(0,0,0,0.5)');
          cb.fillStyle = grd;
          cb.fillRect(0,0,70,44);

          // Reinforced Corners (Gold)
          cb.fillStyle = '#ffb300';
          cb.fillRect(0, 0, 8, 44); // Left
          cb.fillRect(62, 0, 8, 44); // Right
          cb.fillRect(0, 38, 70, 6); // Bottom rim

          // Lock Plate
          cb.fillStyle = '#ffe082';
          cb.beginPath();
          cb.moveTo(28, 0); cb.lineTo(42, 0);
          cb.lineTo(42, 16); cb.lineTo(35, 22); cb.lineTo(28, 16);
          cb.fill();
          cb.fillStyle = '#3e2723'; // Keyhole
          cb.beginPath(); cb.arc(35, 10, 3, 0, Math.PI*2); cb.fill();

          // Rivets
          cb.fillStyle = '#8d6e63';
          [2, 64].forEach(x => {
              [5, 20, 35].forEach(y => {
                  cb.beginPath(); cb.arc(x+4, y, 1.5, 0, Math.PI*2); cb.fill();
              });
          });

          (this.scene.textures.get('chest_body') as Phaser.Textures.CanvasTexture).refresh();
      }

      const cl = getCtx('chest_lid', 70, 36);
      if (cl) {
          // Rounded Top Shape
          cl.beginPath();
          cl.moveTo(0, 36);
          cl.lineTo(0, 10);
          cl.quadraticCurveTo(35, -10, 70, 10);
          cl.lineTo(70, 36);
          cl.closePath();
          
          // Fill Wood
          const grad = cl.createLinearGradient(0, 0, 0, 36);
          grad.addColorStop(0, '#5d4037');
          grad.addColorStop(1, '#3e2723');
          cl.fillStyle = grad;
          cl.fill();

          // Gold Straps (Aligned with body)
          cl.fillStyle = '#ffb300';
          // Use clipping to stay in shape
          cl.save();
          cl.clip();
          cl.fillRect(0, 0, 8, 36);
          cl.fillRect(62, 0, 8, 36);
          cl.fillRect(28, 20, 14, 16); // Latch top
          cl.restore();

          // Highlight
          cl.strokeStyle = 'rgba(255,255,255,0.2)';
          cl.lineWidth = 2;
          cl.stroke();

          (this.scene.textures.get('chest_lid') as Phaser.Textures.CanvasTexture).refresh();
      }

      // --- MAGIC BOX (Mystic Cube) ---
      const bb = getCtx('box_body', 56, 56);
      if (bb) {
          // Deep Purple Base
          const grd = bb.createRadialGradient(28, 10, 5, 28, 28, 40);
          grd.addColorStop(0, '#7b1fa2');
          grd.addColorStop(1, '#4a148c');
          bb.fillStyle = grd;
          bb.fillRect(0, 0, 56, 56);

          // Glowing Runes/Lines
          bb.strokeStyle = '#e040fb';
          bb.lineWidth = 2;
          bb.strokeRect(6, 6, 44, 44);
          
          bb.beginPath();
          bb.moveTo(6, 6); bb.lineTo(20, 20);
          bb.moveTo(50, 6); bb.lineTo(36, 20);
          bb.moveTo(6, 50); bb.lineTo(20, 36);
          bb.moveTo(50, 50); bb.lineTo(36, 36);
          bb.stroke();

          // Center Crystal
          bb.fillStyle = '#ea80fc';
          bb.beginPath();
          bb.moveTo(28, 20); bb.lineTo(36, 28); bb.lineTo(28, 36); bb.lineTo(20, 28);
          bb.fill();
          
          (this.scene.textures.get('box_body') as Phaser.Textures.CanvasTexture).refresh();
      }

      const bl = getCtx('box_lid', 60, 20);
      if (bl) {
          // Tech/Magic Lid
          bl.fillStyle = '#6a1b9a';
          bl.beginPath();
          bl.moveTo(0, 20); bl.lineTo(5, 0); bl.lineTo(55, 0); bl.lineTo(60, 20);
          bl.fill();
          
          bl.fillStyle = '#e040fb';
          bl.fillRect(20, 5, 20, 15); // Latch
          
          bl.fillStyle = '#fff'; // Shine
          bl.globalAlpha = 0.3;
          bl.fillRect(20, 5, 20, 5);

          (this.scene.textures.get('box_lid') as Phaser.Textures.CanvasTexture).refresh();
      }
      
      // --- GLOW ---
      const g = getCtx('chest_glow', 128, 128);
      if (g) {
          const grd = g.createRadialGradient(64, 64, 10, 64, 64, 60);
          grd.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
          grd.addColorStop(1, 'rgba(255, 215, 0, 0)');
          g.fillStyle = grd;
          g.fillRect(0,0,128,128);
          (this.scene.textures.get('chest_glow') as Phaser.Textures.CanvasTexture).refresh();
      }
  }
}