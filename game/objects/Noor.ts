
import Phaser from 'phaser';

export class Noor extends Phaser.GameObjects.Container {
  declare add: (child: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]) => this;
  declare x: number;
  declare y: number;
  declare scene: Phaser.Scene;
  declare setDepth: (value: number) => this;
  declare setScale: (x: number, y?: number) => this;
  declare scaleX: number;
  declare scaleY: number;
  declare getWorldTransformMatrix: (tempMatrix?: Phaser.GameObjects.Components.TransformMatrix, parentMatrix?: Phaser.GameObjects.Components.TransformMatrix) => Phaser.GameObjects.Components.TransformMatrix;
  declare on: (event: string | symbol, fn: Function, context?: any) => this;
  declare setData: (key: any, value?: any) => this;
  declare getData: (key: string) => any;
  
  private character: Phaser.GameObjects.Sprite;
  private glow: Phaser.GameObjects.Image;
  private frameRing: Phaser.GameObjects.Graphics;
  private bgCircle: Phaser.GameObjects.Graphics;
  private maskGraphics: Phaser.GameObjects.Graphics;
  private targetScale: number = 1;
  private floatTween: Phaser.Tweens.Tween | null = null;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    scene.add.existing(this);

    // 1. Glow Effect (Aura) - Behind everything
    this.generateGlowTexture();
    this.glow = scene.add.image(0, 0, 'noor_glow');
    this.glow.setAlpha(0.6);
    this.glow.setBlendMode(Phaser.BlendModes.ADD);
    this.add(this.glow);

    // 2. Background Circle (Dark fill behind character)
    // This hides the background scene through transparent parts of the character image
    this.bgCircle = scene.add.graphics();
    this.bgCircle.fillStyle(0x1a1625, 0.9);
    this.bgCircle.fillCircle(0, 0, 135); // Radius matches frame
    this.add(this.bgCircle);

    // 3. Main Character Sprite
    const useAsset = scene.textures.exists('noor_asset');
    const textureKey = useAsset ? 'noor_asset' : 'noor_char';
    if (!useAsset) this.generateProceduralChar();
    
    this.character = scene.add.sprite(0, 0, textureKey);
    this.character.setOrigin(0.5, 0.5); // Center align
    this.add(this.character);

    // 4. Frame Ring (Gold Border)
    this.frameRing = scene.add.graphics();
    this.frameRing.lineStyle(8, 0xffd700, 1); // Thick Gold Stroke
    this.frameRing.strokeCircle(0, 0, 135);
    // Inner thin ring for detail
    this.frameRing.lineStyle(2, 0xffffff, 0.3);
    this.frameRing.strokeCircle(0, 0, 128);
    this.add(this.frameRing);

    // 5. Masking
    // We create a graphics object for the mask shape (Circle)
    // Note: GeometryMask works in World Space, so we must sync it to the container's transform
    this.maskGraphics = scene.make.graphics({ x: 0, y: 0 }, false);
    this.maskGraphics.fillStyle(0xffffff);
    this.maskGraphics.fillCircle(0, 0, 134); // Slightly smaller than border to hide rough edges
    const mask = new Phaser.Display.Masks.GeometryMask(scene, this.maskGraphics);
    this.character.setMask(mask);

    // Hook update loop to sync mask position with the container as it floats/moves
    scene.events.on('update', this.updateMask, this);
    this.on('destroy', () => {
        scene.events.off('update', this.updateMask, this);
        mask.destroy();
        this.maskGraphics.destroy();
    });
    
    // Initial Layout - set positions but keep offscreen
    this.updateLayout();
    const { width } = this.scene.scale;
    this.x = width + 400; // Force offscreen initially

    // 6. Animations
    
    // Y-Axis Float (Sine wave) - Moves the whole container
    this.floatTween = scene.tweens.add({
        targets: this,
        y: '+=15',
        duration: 3000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
    
    // Glow Pulse
    scene.tweens.add({
        targets: this.glow,
        alpha: 0.4,
        scale: 1.2,
        duration: 2000,
        yoyo: true,
        repeat: -1,
    });

    this.setDepth(100); 
  }

  private updateMask() {
      // Sync the mask graphics to the container's world transform
      // This ensures the mask moves with the container during float/appear animations
      const matrix = this.getWorldTransformMatrix();
      
      this.maskGraphics.x = matrix.tx;
      this.maskGraphics.y = matrix.ty;
      
      // If container scales, mask should scale too
      this.maskGraphics.scaleX = this.scaleX;
      this.maskGraphics.scaleY = this.scaleY;
  }

  private updateLayout() {
      const { width, height } = this.scene.scale;
      
      // Determine orientation
      const isLandscape = width > height;
      
      // Base Size Reference (approx pixel size of the circle art)
      const baseSize = 270;
      
      let targetX, targetY, relativeSize;

      if (isLandscape) {
          // DESKTOP / TABLET LANDSCAPE
          // Position: Middle Right
          relativeSize = height * 0.45; // Take up 45% of height
          
          targetX = width * 0.8; // Right side
          targetY = height * 0.5; // Vertically centered
      } else {
          // MOBILE PORTRAIT
          // Position: Top Center (Above the React Question Modal)
          // The Question modal usually takes up the bottom/center, so we squeeze Noor at the top
          relativeSize = width * 0.4; // Take up 40% of width
          
          targetX = width * 0.5; // Center X
          targetY = height * 0.22; // Top 22% of screen
      }

      this.targetScale = relativeSize / baseSize;
      this.setScale(this.targetScale);

      // Scale character inside frame
      const charSize = Math.min(this.character.width, this.character.height);
      if (charSize > 0) {
          const scaleFactor = (270 / charSize) * 1.15; 
          this.character.setScale(scaleFactor);
      }
      this.character.y = 25; 

      // Store target for appear animation
      this.setData('targetX', targetX);
      this.setData('targetY', targetY);
      
      // Apply Y immediately so animation only handles X slide (or slide from top)
      this.y = targetY;
  }

  public appear() {
      this.updateLayout(); 
      const targetX = this.getData('targetX');
      const { width } = this.scene.scale;
      
      // Reset offscreen position before tweening in
      this.x = width + 400;

      this.scene.tweens.add({
          targets: this,
          x: targetX,
          duration: 800,
          ease: 'Power2.out', 
      });
  }

  public dismiss() {
      const { width } = this.scene.scale;
      this.scene.tweens.add({
          targets: this,
          x: width + 400,
          duration: 600,
          ease: 'Back.in',
      });
  }

  private generateGlowTexture() {
      if (!this.scene.textures.exists('noor_glow')) {
          const size = 512;
          const gCanvas = this.scene.textures.createCanvas('noor_glow', size, size);
          if(gCanvas) {
              const ctx = gCanvas.context;
              const cx = size/2, cy = size/2;
              const grd = ctx.createRadialGradient(cx, cy, 100, cx, cy, 250);
              grd.addColorStop(0, 'rgba(255, 215, 0, 0.6)'); // Gold glow center
              grd.addColorStop(1, 'rgba(255, 215, 0, 0)');   // Transparent edge
              ctx.fillStyle = grd;
              ctx.fillRect(0,0,size,size);
              gCanvas.refresh();
          }
      }
  }

  private generateProceduralChar() {
      if (this.scene.textures.exists('noor_char')) return;
      
      const w = 200, h = 200;
      const canvas = this.scene.textures.createCanvas('noor_char', w, h);
      if(canvas) {
          const ctx = canvas.context;
          const cx = w/2;
          
          // Simple geometric placeholder for Noor
          const grd = ctx.createLinearGradient(0, 20, 0, h);
          grd.addColorStop(0, '#1abc9c'); 
          grd.addColorStop(1, '#0e6655'); 
          ctx.fillStyle = grd;
          
          // Robe shape
          ctx.beginPath();
          ctx.ellipse(cx, h, 60, 80, 0, Math.PI, 0);
          ctx.fill();

          // Head
          ctx.fillStyle = '#f1c40f'; // Turban/Hat
          ctx.beginPath(); 
          ctx.arc(cx, 60, 35, 0, Math.PI*2); 
          ctx.fill();
          
          ctx.fillStyle = '#ffdfc4'; // Face
          ctx.beginPath(); 
          ctx.arc(cx, 65, 25, 0, Math.PI*2); 
          ctx.fill();

          canvas.refresh();
      }
  }
}
