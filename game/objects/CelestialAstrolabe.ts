
import Phaser from 'phaser';
import { LibraryAssetGenerator } from '../generators/LibraryAssetGenerator';

export class CelestialAstrolabe extends Phaser.GameObjects.Container {
  declare scene: Phaser.Scene;
  declare x: number;
  declare y: number;
  declare add: (child: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]) => this;
  declare setDepth: (value: number) => this;
  declare destroy: (fromScene?: boolean) => void;
  declare active: boolean;

  private outerRing!: Phaser.GameObjects.Sprite;
  private midRing!: Phaser.GameObjects.Sprite;
  private innerRing!: Phaser.GameObjects.Sprite;
  private core!: Phaser.GameObjects.Sprite;
  private constellationGroup: Phaser.GameObjects.Container;
  
  private stars: Phaser.GameObjects.Sprite[] = [];
  private starLines: Phaser.GameObjects.Graphics;
  
  private isSolved: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);
    this.setDepth(30); // Very high depth

    // Ensure assets
    LibraryAssetGenerator.init(scene);

    // 1. Rings (Spinning Mechanism)
    this.outerRing = scene.add.sprite(0, 0, 'astrolabe_ring_outer');
    this.midRing = scene.add.sprite(0, 0, 'astrolabe_ring_mid');
    this.innerRing = scene.add.sprite(0, 0, 'astrolabe_ring_inner');
    this.core = scene.add.sprite(0, 0, 'astrolabe_core');

    // Add glow to core
    const coreGlow = scene.add.image(0, 0, 'astrolabe_core');
    coreGlow.setScale(1.5);
    coreGlow.setAlpha(0.5);
    coreGlow.setBlendMode(Phaser.BlendModes.ADD);
    
    this.add([this.outerRing, this.midRing, this.innerRing, coreGlow, this.core]);

    // Idle Rotation
    scene.tweens.add({ targets: this.outerRing, angle: 360, duration: 25000, repeat: -1 });
    scene.tweens.add({ targets: this.midRing, angle: -360, duration: 18000, repeat: -1 });
    scene.tweens.add({ targets: this.innerRing, angle: 360, duration: 12000, repeat: -1 });
    
    // Core Pulse
    scene.tweens.add({ 
        targets: [this.core, coreGlow], 
        scale: 1.1, 
        alpha: 0.8,
        duration: 1500, 
        yoyo: true, 
        repeat: -1,
        ease: 'Sine.easeInOut'
    });

    // 2. Constellation (Initially hidden or faint)
    this.constellationGroup = scene.add.container(0, -250);
    this.add(this.constellationGroup);
    
    this.starLines = scene.add.graphics();
    this.constellationGroup.add(this.starLines);
    
    // Leo Configuration
    const starPoints = [
        { x: -80, y: 50 },  // Front paw
        { x: -60, y: 0 },   // Chest
        { x: -30, y: -40 }, // Mane
        { x: 0, y: -60 },   // Head top
        { x: 20, y: -30 },  // Nose
        { x: 40, y: 0 },    // Neck back
        { x: 80, y: 20 },   // Back
        { x: 100, y: 60 },  // Tail base
        { x: 110, y: 30 }   // Tail tip
    ];

    starPoints.forEach(p => {
        const star = scene.add.sprite(p.x, p.y, 'star_collectible');
        star.setScale(0.2);
        star.setAlpha(0.3); // Faint
        star.setTint(0xffd700);
        this.constellationGroup.add(star);
        this.stars.push(star);
    });
  }

  public update(frameMove: number) {
      // Moves with the world logic controlled by EventManager
      // Generally we want it to scroll in, then stop when player stops
      // The EventManager handles the X position logic mostly.
  }

  public solve(onComplete: () => void) {
      if (this.isSolved) return;
      this.isSolved = true;

      // 1. Rapid Spin & Alignment
      this.scene.tweens.killTweensOf([this.outerRing, this.midRing, this.innerRing]);
      
      this.scene.tweens.add({
          targets: [this.outerRing, this.midRing, this.innerRing],
          angle: 0, // Snap to 0
          duration: 1500,
          ease: 'Elastic.out',
          onComplete: () => {
              // 2. Light Up Constellation
              this.drawConstellationLines();
              // 3. Shake and Deploy
              this.scene.cameras.main.shake(500, 0.005);
              this.deployBridge(onComplete);
          }
      });

      // Core Flash
      this.scene.tweens.add({
          targets: this.core,
          scale: 3,
          alpha: 1,
          duration: 1000,
          yoyo: true,
          onYoyo: () => { 
              this.core.setTint(0x00e5ff); 
          }
      });
  }

  private drawConstellationLines() {
      this.starLines.clear();
      this.starLines.lineStyle(3, 0x00e5ff, 1);
      
      // Connect stars sequentially for Leo
      this.starLines.beginPath();
      this.starLines.moveTo(this.stars[0].x, this.stars[0].y);
      for(let i=1; i<this.stars.length; i++) {
          this.starLines.lineTo(this.stars[i].x, this.stars[i].y);
      }
      this.starLines.strokePath();
      
      // Flash stars
      this.stars.forEach(s => {
          s.setAlpha(1);
          s.setTint(0x00e5ff);
          s.setScale(0.4);
      });
  }

  private deployBridge(onComplete: () => void) {
      const gapWidth = 600; 
      const segWidth = 100;
      const count = gapWidth / segWidth;
      
      // Visual Beam shooting down
      const beam = this.scene.add.rectangle(0, 0, 10, 10, 0x00e5ff);
      beam.setBlendMode(Phaser.BlendModes.ADD);
      this.add(beam);
      
      this.scene.tweens.add({
          targets: beam,
          scaleX: 5,
          scaleY: 60, // Shoot down to floor
          alpha: { from: 1, to: 0 },
          duration: 800,
          ease: 'Quad.out'
      });

      // Call Scene to create physical platform
      // Bridge Y should be ground level (screen height - 128)
      // The Astrolabe is centered at (x, centerY)
      
      // We need absolute world coordinates for the bridge segments
      // The gap is centered at `this.x`.
      
      const groundY = this.scene.scale.height - 110; 
      
      // @ts-ignore - access environment manager
      const platform = this.scene.environmentManager.platform;
      
      for(let i=0; i<count; i++) {
          // Calculate X relative to the Astrolabe center
          const segX = this.x - (gapWidth/2) + (i * segWidth) + (segWidth/2);
          
          this.scene.time.delayedCall(i * 150, () => {
              // Create physical floating platform at that spot
              platform.spawnBridgeSegment(segX, groundY);
              
              // Sound effect placeholder visual (Ripple)
              const ripple = this.scene.add.circle(segX, groundY, 10, 0x00e5ff, 0.5);
              this.scene.tweens.add({
                  targets: ripple,
                  scale: 3,
                  alpha: 0,
                  duration: 500,
                  onComplete: () => ripple.destroy()
              });
          });
      }

      this.scene.time.delayedCall(count * 150 + 1000, onComplete);
  }
}
