
import Phaser from 'phaser';

export class CityGate extends Phaser.GameObjects.Container {
  declare scene: Phaser.Scene;
  declare name: string;
  declare x: number;
  declare y: number;
  declare add: (child: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]) => this;
  declare setDepth: (value: number) => this;
  declare destroy: (fromScene?: boolean) => void;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    // 1. The Archway Frame
    const arch = scene.add.image(0, 0, 'city_grand_gate');
    arch.setOrigin(0.5, 1); // Anchored bottom center
    this.add(arch);

    // 2. Hanging Lantern (Swinging)
    // Adjusted Y to match the visual "light spot" on the texture
    const lanternY = -580; 
    
    // Chain
    const chain = scene.add.tileSprite(0, lanternY - 50, 6, 100, 'fg_chain'); 
    chain.setOrigin(0.5, 1);
    this.add(chain);

    // Lamp
    const lamp = scene.add.image(0, lanternY, 'fg_hanging_lamp'); 
    lamp.setScale(0.8);
    lamp.setOrigin(0.5, 0);
    this.add(lamp);

    // Glow Sprite (The dynamic light)
    const glow = scene.add.image(0, lanternY + 40, 'fg_lamp_light');
    glow.setBlendMode(Phaser.BlendModes.ADD);
    glow.setAlpha(0.6);
    this.add(glow);

    // 3. Swing Animation
    scene.tweens.add({
        targets: [lamp, glow],
        angle: { from: -5, to: 5 },
        duration: 2000 + Math.random() * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
    
    scene.tweens.add({
        targets: chain,
        angle: { from: -5, to: 5 },
        duration: 2000 + Math.random() * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });

    // High Foreground Depth to frame the player
    this.setDepth(45); 
  }

  static generateTexture(scene: Phaser.Scene) {
      if (scene.textures.exists('city_grand_gate')) return;

      const W = 1024; 
      const H = 800; 
      const canvas = scene.textures.createCanvas('city_grand_gate', W, H);
      if (!canvas) return;
      const ctx = canvas.context;
      const cx = W / 2;

      // --- 1. BASE WALL (Return to Dark Purple) ---
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#1a1625'); // Night Sky Black (Top)
      grad.addColorStop(1, '#2d2640'); // Dark Purple/Slate (Bottom)
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // --- 2. BRICK TEXTURE (Subtle) ---
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      const brickH = 50;
      for (let y = 0; y < H; y += brickH) {
          ctx.fillRect(0, y, W, 4); 
          const offset = (y / brickH) % 2 === 0 ? 0 : 40;
          for (let x = offset; x < W; x += 80) {
              ctx.fillRect(x, y, 4, brickH);
          }
      }

      // --- 3. ARCH GEOMETRY ---
      const openW = 600; 
      const archCenterY = H - 550; 
      const radius = 300; 

      // --- 4. CUTOUT (The Hole) ---
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.moveTo(cx - openW/2, H);
      ctx.lineTo(cx - openW/2, archCenterY + 50); 
      ctx.arc(cx, archCenterY + 50, radius, Math.PI, 0); 
      ctx.lineTo(cx + openW/2, H);
      ctx.closePath();
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';

      // --- 5. 3D DEPTH ---
      const thickness = 25;
      
      const gradLeft = ctx.createLinearGradient(cx - openW/2 - thickness, 0, cx - openW/2, 0);
      gradLeft.addColorStop(0, '#2d2640');
      gradLeft.addColorStop(1, '#15101e'); 
      ctx.fillStyle = gradLeft;
      ctx.fillRect(cx - openW/2 - thickness, archCenterY + 50, thickness, H - (archCenterY + 50));

      const gradRight = ctx.createLinearGradient(cx + openW/2, 0, cx + openW/2 + thickness, 0);
      gradRight.addColorStop(0, '#15101e'); 
      gradRight.addColorStop(1, '#2d2640');
      ctx.fillStyle = gradRight;
      ctx.fillRect(cx + openW/2, archCenterY + 50, thickness, H - (archCenterY + 50));

      ctx.lineWidth = thickness;
      ctx.strokeStyle = '#15101e'; 
      ctx.beginPath();
      ctx.arc(cx, archCenterY + 50, radius + thickness/2, Math.PI, 0);
      ctx.stroke();

      // --- 6. DECORATION (Gold Trim) ---
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#ffb300'; 
      ctx.beginPath();
      ctx.moveTo(cx - openW/2 - thickness, H);
      ctx.lineTo(cx - openW/2 - thickness, archCenterY + 50);
      ctx.arc(cx, archCenterY + 50, radius + thickness, Math.PI, 0);
      ctx.lineTo(cx + openW/2 + thickness, H);
      ctx.stroke();

      // --- 7. LANTERN WARM GLOW ON WALL (Backlight Effect) ---
      // This paints a subtle warm gradient on the stone itself where the lantern hangs
      const lanternY = archCenterY - radius - 30; // Approx location of lantern
      const lanternGlow = ctx.createRadialGradient(cx, lanternY, 10, cx, lanternY, 120);
      lanternGlow.addColorStop(0, 'rgba(255, 160, 0, 0.4)'); // Amber center
      lanternGlow.addColorStop(1, 'rgba(255, 160, 0, 0)');   // Fade out
      ctx.fillStyle = lanternGlow;
      ctx.fillRect(cx - 120, lanternY - 120, 240, 240);

      // --- 8. MOSAIC BAND (Warm Glow) ---
      const bandY = archCenterY - radius - 60;
      
      // Band Background (Dark Blue to contrast the gold)
      ctx.fillStyle = '#1a237e'; 
      ctx.fillRect(0, bandY, W, 40);
      
      // Gold borders
      ctx.fillStyle = '#ffb300';
      ctx.fillRect(0, bandY, W, 4);
      ctx.fillRect(0, bandY + 36, W, 4);
      
      // Glowing Diamonds
      // We use shadowBlur to create the "Warm Glow" effect
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ff6f00'; // Deep Orange/Amber glow
      ctx.fillStyle = '#ffca28';   // Gold/Amber tiles
      
      for(let x=20; x<W; x+=60) {
          ctx.beginPath();
          ctx.moveTo(x, bandY + 20);
          ctx.lineTo(x+15, bandY + 10);
          ctx.lineTo(x+30, bandY + 20);
          ctx.lineTo(x+15, bandY + 30);
          ctx.fill();
      }
      
      // Reset Shadow for subsequent operations
      ctx.shadowBlur = 0;

      canvas.refresh();
  }
}
