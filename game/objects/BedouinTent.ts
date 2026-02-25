
import Phaser from 'phaser';

export class BedouinTent extends Phaser.GameObjects.Container {
  declare scene: Phaser.Scene;
  declare x: number;
  declare y: number;
  declare add: (child: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]) => this;
  declare setDepth: (value: number) => this;
  declare setScale: (x: number, y?: number) => this;
  declare destroy: (fromScene?: boolean) => void;
  declare active: boolean;
  
  private lightGlow!: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    const tent = scene.add.sprite(0, 0, 'bedouin_tent');
    tent.setOrigin(0.5, 1);
    
    // Inner Glow (For when player is inside)
    if (!scene.textures.exists('tent_glow')) {
        const size = 128;
        const canvas = scene.textures.createCanvas('tent_glow', size, size);
        if (canvas) {
            const ctx = canvas.context;
            const cx = size/2;
            const grd = ctx.createRadialGradient(cx, cx, 10, cx, cx, 50);
            grd.addColorStop(0, 'rgba(255, 160, 0, 0.6)'); // Warm orange
            grd.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grd;
            ctx.fillRect(0,0,size,size);
            canvas.refresh();
        }
    }
    
    this.lightGlow = scene.add.image(0, -30, 'tent_glow');
    this.lightGlow.setBlendMode(Phaser.BlendModes.ADD);
    this.lightGlow.setAlpha(0); // Start off
    
    this.add(tent);
    this.add(this.lightGlow);
    
    // Positioned slightly further back visually
    this.setDepth(8.5); 
    this.setScale(Phaser.Math.FloatBetween(0.8, 0.95));
  }
  
  public setOccupied(occupied: boolean) {
      this.scene.tweens.add({
          targets: this.lightGlow,
          alpha: occupied ? 1 : 0,
          scale: occupied ? 1.5 : 1,
          duration: 1000,
          yoyo: occupied, // Pulse if occupied
          repeat: occupied ? -1 : 0
      });
  }

  static generateTexture(scene: Phaser.Scene) {
      if (scene.textures.exists('bedouin_tent')) return;

      const W = 260;
      const H = 140;
      const canvas = scene.textures.createCanvas('bedouin_tent', W, H);
      if (!canvas) return;
      const ctx = canvas.context;
      const cx = W / 2;
      const bottomY = H - 10;

      // 1. Ground Shadow (Soft ambient occlusion)
      const grdShadow = ctx.createRadialGradient(cx, bottomY, 10, cx, bottomY, W/2);
      grdShadow.addColorStop(0, 'rgba(0,0,0,0.6)');
      grdShadow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grdShadow;
      ctx.fillRect(0, bottomY - 10, W, 20);

      // --- INTERIOR (Visible through opening) ---
      const openW = 100;
      const openH = 60;
      const openX = cx - openW/2;
      const openY = bottomY - openH;

      // Inner Darkness
      ctx.fillStyle = '#100c08';
      ctx.fillRect(openX, openY, openW, openH);

      // Bedouin Rug (Sadu Pattern) on floor
      const rugH = 10;
      const rugY = bottomY - rugH;
      ctx.fillStyle = '#b71c1c'; // Red base
      ctx.fillRect(openX + 10, rugY, openW - 20, rugH);
      // Rug Details
      ctx.fillStyle = '#fff';
      for(let i=openX+20; i<openX+openW-20; i+=10) {
          ctx.beginPath();
          ctx.moveTo(i, rugY);
          ctx.lineTo(i+5, rugY+5);
          ctx.lineTo(i, rugY+10);
          ctx.lineTo(i-5, rugY+5);
          ctx.fill();
      }

      // Dallah (Coffee Pot) Silhouette
      const dalX = cx;
      const dalY = rugY + 5;
      ctx.fillStyle = '#ffd700'; // Gold brass
      ctx.beginPath();
      ctx.moveTo(dalX, dalY);
      ctx.lineTo(dalX + 8, dalY); // Base
      ctx.lineTo(dalX + 6, dalY - 15); // Body
      ctx.lineTo(dalX + 2, dalY - 20); // Neck
      ctx.lineTo(dalX + 2, dalY - 25); // Lid
      ctx.lineTo(dalX - 2, dalY - 25);
      ctx.lineTo(dalX - 2, dalY - 20);
      ctx.lineTo(dalX - 6, dalY - 15);
      ctx.lineTo(dalX - 8, dalY);
      ctx.fill();
      // Spout
      ctx.beginPath();
      ctx.moveTo(dalX - 6, dalY - 12);
      ctx.quadraticCurveTo(dalX - 12, dalY - 18, dalX - 12, dalY - 22);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.stroke();


      // --- TENT CLOTH (Bayt Al-Sha'ar) ---
      // Define the main shape path
      const path = new Path2D();
      // Start Bottom Left
      path.moveTo(10, bottomY);
      // Left Eave
      path.lineTo(5, bottomY - 50);
      // Roof Line (Catenary Sag between poles)
      // Pole 1 (Left-ish)
      path.quadraticCurveTo(W*0.25, bottomY - 80, W*0.35, bottomY - 90); 
      // Sag Middle
      path.quadraticCurveTo(W*0.5, bottomY - 75, W*0.65, bottomY - 90);
      // Right Eave
      path.quadraticCurveTo(W*0.75, bottomY - 80, W - 5, bottomY - 50);
      // Bottom Right
      path.lineTo(W - 10, bottomY);
      // Bottom Edge (Curved up for opening)
      path.lineTo(cx + openW/2 + 10, bottomY); // Right flap end
      path.lineTo(cx + openW/2, bottomY - openH + 10); // Right flap top
      path.quadraticCurveTo(cx, bottomY - openH - 5, cx - openW/2, bottomY - openH + 10); // Arch over opening
      path.lineTo(cx - openW/2 - 10, bottomY); // Left flap end
      path.closePath();

      // Clip to Shape
      ctx.save();
      ctx.clip(path);

      // Draw Stripes (Woven Goat Hair)
      // Traditional is alternating black and dark brown
      const stripeH = 10;
      for (let y = 0; y < H; y += stripeH) {
          ctx.fillStyle = (y/stripeH) % 2 === 0 ? '#3e2723' : '#1a1a1a'; // Brown / Black
          ctx.fillRect(0, y, W, stripeH);
          
          // Add woven texture noise
          ctx.fillStyle = 'rgba(255,255,255,0.05)';
          for(let k=0; k<20; k++) {
              ctx.fillRect(Math.random()*W, y, 2 + Math.random()*4, stripeH);
          }
      }
      
      // Divider lines (seams between strips)
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 1;
      for (let y = 0; y < H; y += stripeH) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      ctx.restore(); // End Clip

      // --- STRUCTURE (Poles & Ropes) ---
      
      // Main Poles (sticking out top)
      ctx.fillStyle = '#5d4037'; // Wood
      // Pole 1
      ctx.fillRect(W*0.35 - 2, bottomY - 100, 4, 20);
      // Pole 2
      ctx.fillRect(W*0.65 - 2, bottomY - 100, 4, 20);

      // Guy Ropes (Tension)
      ctx.strokeStyle = '#8d6e63'; // Rope color
      ctx.lineWidth = 1.5;
      
      // Left Rope
      ctx.beginPath(); 
      ctx.moveTo(W*0.35, bottomY - 90); // From Pole 1 top
      ctx.lineTo(0, bottomY); // To ground
      ctx.stroke();
      
      // Right Rope
      ctx.beginPath(); 
      ctx.moveTo(W*0.65, bottomY - 90); // From Pole 2 top
      ctx.lineTo(W, bottomY); // To ground
      ctx.stroke();
      
      // Middle Sag Rope (Visual detail)
      ctx.beginPath();
      ctx.moveTo(W*0.35, bottomY - 90);
      ctx.quadraticCurveTo(W*0.5, bottomY - 80, W*0.65, bottomY - 90);
      ctx.stroke();

      canvas.refresh();
  }
}
