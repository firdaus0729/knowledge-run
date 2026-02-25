import Phaser from 'phaser';

export class StackOfRugs extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  declare scene: Phaser.Scene;
  declare x: number;
  declare y: number;
  declare setDepth: (value: number) => this;
  declare setOrigin: (x?: number, y?: number) => this;
  declare destroy: (fromScene?: boolean) => void;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'stack_rugs');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(19); // Foreground-ish gameplay layer
    this.setOrigin(0.5, 1); 

    // Physics Setup
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    
    // Hitbox: Roughly the shape of the pile. 
    // The texture is ~140px wide. We want a forgiving landing spot.
    body.setSize(120, 65); 
    body.setOffset(10, 25); 

    // One-Way Collision: Jump up through, land on top
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
    if (scene.textures.exists('stack_rugs')) return;

    const W = 140;
    const H = 90;
    const canvas = scene.textures.createCanvas('stack_rugs', W, H);
    if (!canvas) return;
    const ctx = canvas.context;

    // Helper: Draw a Rolled Rug (Cylinder side view)
    // x, y: Position
    // w, h: Size
    // baseColor, patternColor: Theme
    // type: 'rolled' (cylinder) or 'folded' (rectangle with rounded edges)
    const drawRug = (x: number, y: number, w: number, h: number, baseColor: string, patternColor: string, type: 'rolled' | 'folded') => {
        
        ctx.save();
        
        // 1. Base Shape
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        if (type === 'rolled') {
            // Rounded Rectangle for cylinder side
            ctx.roundRect(x, y, w, h, h/2);
        } else {
            // Folded: softer rect
            ctx.roundRect(x, y, w, h, 8);
        }
        ctx.fill();

        // 2. Texture/Pattern
        ctx.fillStyle = patternColor;
        ctx.globalAlpha = 0.8;
        
        if (type === 'rolled') {
            // Spirals on ends to show it's rolled
            ctx.beginPath(); ctx.arc(x + h/2, y + h/2, h/3, 0, Math.PI*2); ctx.fill(); // Left end cap detail
            ctx.beginPath(); ctx.arc(x + w - h/2, y + h/2, h/3, 0, Math.PI*2); ctx.fill(); // Right end cap detail
            
            // Vertical Stripes (The pattern of the rug rolled up)
            for(let i = x + h; i < x + w - h; i += 8) {
                ctx.fillRect(i, y, 4, h);
            }
        } else {
            // Folded: Horizontal intricate bands
            ctx.fillRect(x, y + h*0.2, w, h*0.1);
            ctx.fillRect(x, y + h*0.5, w, h*0.1);
            ctx.fillRect(x, y + h*0.8, w, h*0.1);
            
            // Vertical connection lines (Mosaic feel)
            for(let i = x + 10; i < x + w - 10; i += 15) {
                ctx.fillRect(i, y + 5, 5, h - 10);
            }
        }
        ctx.globalAlpha = 1.0;

        // 3. Shading (Cylindrical gradient look)
        const grad = ctx.createLinearGradient(0, y, 0, y+h);
        grad.addColorStop(0, 'rgba(255,255,255,0.2)'); // Highlight top
        grad.addColorStop(0.5, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(0,0,0,0.3)'); // Shadow bottom
        ctx.fillStyle = grad;
        ctx.fill();

        // 4. Fringe (Tassels)
        ctx.fillStyle = '#eee'; // White-ish fringe
        const fringeLen = 6;
        if (type === 'rolled') {
            // Fringes sticking out the sides
            // Left
            for(let fy = y + 5; fy < y + h - 5; fy += 4) {
                ctx.fillRect(x - fringeLen, fy, fringeLen, 1);
            }
            // Right
            for(let fy = y + 5; fy < y + h - 5; fy += 4) {
                ctx.fillRect(x + w, fy, fringeLen, 1);
            }
        } else {
            // Fringes on the bottom edge if visible, or sides
            for(let fy = y + 5; fy < y + h - 5; fy += 4) {
                ctx.fillRect(x - 3, fy, 3, 1);
                ctx.fillRect(x + w, fy, 3, 1);
            }
        }

        ctx.restore();
    };

    // --- RUG 1: Bottom (The Foundation) ---
    // Large, Folded, Deep Red & Gold
    drawRug(10, H - 35, 120, 35, '#880e4f', '#ffc107', 'folded');

    // --- RUG 2: Middle (The Bulk) ---
    // Rolled, Navy Blue & Cyan
    drawRug(20, H - 65, 100, 30, '#1a237e', '#4dd0e1', 'rolled');

    // --- RUG 3: Top (The Detail) ---
    // Small Rolled, Teal & White
    drawRug(40, H - 85, 60, 20, '#00695c', '#b2dfdb', 'rolled');

    // Drop Shadow under the whole pile
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(W/2, H-5, 60, 10, 0, 0, Math.PI*2);
    ctx.fill();

    canvas.refresh();
  }
}