import Phaser from 'phaser';

export class MerchantCart extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  declare scene: Phaser.Scene;
  declare x: number;
  declare y: number;
  declare setDepth: (value: number) => this;
  declare setOrigin: (x?: number, y?: number) => this;
  declare destroy: (fromScene?: boolean) => void;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'merchant_cart');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(19); // Just behind the player (20) but in front of background
    this.setOrigin(0.5, 1); // Anchor at bottom center for easy ground placement

    // Physics Setup
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    
    // Hitbox: Only cover the main body/crates, ignore the handles/wheels for smoother running
    // The texture is ~140px wide. We want a solid landing surface.
    body.setSize(110, 60); 
    body.setOffset(15, 20); // Lower the hitbox slightly to match crate tops

    // One-Way Collision: Allow jumping UP through it, but land ON it
    body.checkCollision.down = false;
    body.checkCollision.left = false;
    body.checkCollision.right = false;
    body.checkCollision.up = true;
  }

  update(speed: number) {
    this.x -= speed;
    if (this.x < -200) {
      this.destroy();
    }
  }

  static generateTexture(scene: Phaser.Scene) {
    if (scene.textures.exists('merchant_cart')) return;

    const W = 160;
    const H = 100;
    const canvas = scene.textures.createCanvas('merchant_cart', W, H);
    if (!canvas) return;
    const ctx = canvas.context;

    // --- 1. WHEELS (Back) ---
    // We draw these first so they appear behind the chassis
    const drawWheel = (wx: number, wy: number) => {
        ctx.fillStyle = '#3e2723'; // Dark Wood
        ctx.beginPath(); ctx.arc(wx, wy, 20, 0, Math.PI*2); ctx.fill();
        
        ctx.strokeStyle = '#5d4037'; // Lighter Wood Spokes
        ctx.lineWidth = 3;
        for(let i=0; i<4; i++) {
            ctx.beginPath(); 
            ctx.moveTo(wx + Math.cos(i*0.78)*20, wy + Math.sin(i*0.78)*20);
            ctx.lineTo(wx - Math.cos(i*0.78)*20, wy - Math.sin(i*0.78)*20);
            ctx.stroke();
        }
        
        ctx.strokeStyle = '#212121'; // Iron Rim
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(wx, wy, 20, 0, Math.PI*2); ctx.stroke();
    };
    drawWheel(40, H-22);
    drawWheel(110, H-22);

    // --- 2. CHASSIS / CART BODY ---
    // Main wooden platform
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(20, H-45, 110, 15);
    
    // Wood grain detail
    ctx.fillStyle = '#4e342e';
    ctx.fillRect(20, H-40, 110, 2);

    // Handles (Push bars)
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#6d4c41';
    ctx.beginPath();
    ctx.moveTo(130, H-40); ctx.lineTo(150, H-50); // Right handle
    ctx.stroke();

    // Legs (Front prop)
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(125, H-30, 8, 25);

    // --- 3. CRATES ---
    const drawCrate = (cx: number, cy: number, cw: number, ch: number, color: string) => {
        ctx.fillStyle = color; // Wood color
        ctx.fillRect(cx, cy, cw, ch);
        
        // Frame
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx, cy, cw, ch);
        
        // Slats
        ctx.beginPath();
        ctx.moveTo(cx, cy + ch/2); ctx.lineTo(cx+cw, cy+ch/2);
        ctx.moveTo(cx, cy + ch - 5); ctx.lineTo(cx+cw, cy+ch - 5);
        ctx.stroke();
        
        // Nails
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(cx+2, cy+2, 1, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx+cw-2, cy+2, 1, 0, Math.PI*2); ctx.fill();
    };

    // Crate 1 (Left, Large)
    drawCrate(30, H-80, 45, 35, '#a1887f');
    // Crate 2 (Right, Medium)
    drawCrate(80, H-75, 40, 30, '#8d6e63');

    // --- 4. FRUIT (The "Pop" of color) ---
    
    // Oranges (In Left Crate)
    const drawOrange = (ox: number, oy: number) => {
        ctx.fillStyle = '#ff9800';
        ctx.beginPath(); ctx.arc(ox, oy, 5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.4)'; // Shine
        ctx.beginPath(); ctx.arc(ox-1, oy-1, 1.5, 0, Math.PI*2); ctx.fill();
    };
    
    // Pile of oranges
    for(let i=0; i<4; i++) drawOrange(35 + (i*9), H-83);
    for(let i=0; i<3; i++) drawOrange(40 + (i*9), H-88);
    for(let i=0; i<2; i++) drawOrange(45 + (i*9), H-93);

    // Pomegranates (In Right Crate)
    const drawPom = (px: number, py: number) => {
        ctx.fillStyle = '#c2185b'; // Red/Pink
        ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#880e4f'; // Dark spot
        ctx.beginPath(); ctx.arc(px, py-2, 1.5, 0, Math.PI*2); ctx.fill();
    };

    // Pile of pomegranates
    for(let i=0; i<3; i++) drawPom(85 + (i*10), H-78);
    for(let i=0; i<2; i++) drawPom(90 + (i*10), H-85);

    // --- 5. HANGING CLOTH (Market vibe) ---
    ctx.fillStyle = '#009688'; // Teal cloth
    ctx.beginPath();
    ctx.moveTo(20, H-45);
    ctx.lineTo(20, H-25);
    ctx.lineTo(35, H-35);
    ctx.lineTo(50, H-20);
    ctx.lineTo(50, H-45);
    ctx.fill();

    canvas.refresh();
  }
}