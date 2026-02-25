
import Phaser from 'phaser';

export class AncientWell extends Phaser.GameObjects.Container {
  declare add: (child: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]) => this;
  declare setDepth: (value: number) => this;
  declare setScale: (x: number, y?: number) => this;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    const well = scene.add.sprite(0, 0, 'ancient_well');
    well.setOrigin(0.5, 1);
    
    this.add(well);
    
    // Positioned similar to ruins/tents
    this.setDepth(9.2); 
    this.setScale(Phaser.Math.FloatBetween(0.9, 1.1));
  }

  static generateTexture(scene: Phaser.Scene) {
      if (scene.textures.exists('ancient_well')) return;

      const W = 160;
      const H = 180;
      const canvas = scene.textures.createCanvas('ancient_well', W, H);
      if (!canvas) return;
      const ctx = canvas.context;
      const cx = W / 2;
      const bottomY = H - 10;

      // 1. Rear Posts (Depth)
      ctx.fillStyle = '#3e2723';
      ctx.fillRect(cx - 35, bottomY - 120, 8, 120); // Left Post
      ctx.fillRect(cx + 27, bottomY - 120, 8, 120); // Right Post

      // 2. Crossbeam & Spindle
      ctx.fillStyle = '#4e342e';
      ctx.fillRect(cx - 40, bottomY - 125, 80, 10); // Top Beam
      
      // Spindle (Cylinder)
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(cx - 30, bottomY - 100, 60, 12);
      ctx.fillStyle = '#3e2723'; // Shadow under spindle
      ctx.beginPath(); ctx.arc(cx - 30, bottomY - 94, 6, 0, Math.PI*2); ctx.fill();

      // 3. Rope & Bucket
      // Rope coiled on spindle
      ctx.strokeStyle = '#bdbdbd'; // Old grey rope
      ctx.lineWidth = 2;
      for(let i=0; i<5; i++) {
          ctx.beginPath();
          ctx.arc(cx - 10 + (i*4), bottomY - 94, 7, 0, Math.PI);
          ctx.stroke();
      }
      
      // Hanging Rope
      ctx.beginPath();
      ctx.moveTo(cx, bottomY - 94);
      ctx.lineTo(cx, bottomY - 50);
      ctx.stroke();

      // Bucket
      const bx = cx;
      const by = bottomY - 35;
      ctx.fillStyle = '#6d4c41';
      ctx.beginPath();
      ctx.moveTo(bx - 10, by - 15);
      ctx.lineTo(bx + 10, by - 15);
      ctx.lineTo(bx + 8, by + 5);
      ctx.lineTo(bx - 8, by + 5);
      ctx.closePath();
      ctx.fill();
      // Bucket Bands (Iron)
      ctx.fillStyle = '#212121';
      ctx.fillRect(bx - 9, by - 10, 18, 2);
      ctx.fillRect(bx - 8, by, 16, 2);


      // 4. Stone Base (The Well)
      const wellW = 90;
      const wellH = 50;
      const wellY = bottomY - wellH;

      // Base shape
      const grd = ctx.createLinearGradient(0, wellY, 0, bottomY);
      grd.addColorStop(0, '#757575'); // Grey stone top
      grd.addColorStop(1, '#424242'); // Dark stone bottom
      ctx.fillStyle = grd;
      
      ctx.beginPath();
      ctx.ellipse(cx, bottomY, wellW/2, 10, 0, 0, Math.PI*2); // Bottom curve
      ctx.fillRect(cx - wellW/2, wellY, wellW, wellH);
      ctx.ellipse(cx, wellY, wellW/2, 8, 0, 0, Math.PI*2); // Top rim
      ctx.fill();

      // Interior (Dark hole)
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.ellipse(cx, wellY, wellW/2 - 10, 5, 0, 0, Math.PI*2);
      ctx.fill();

      // Stone Bricks Texture
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 1;
      const rows = 4;
      const rowH = wellH / rows;
      
      for(let r=0; r<rows; r++) {
          const y = wellY + (r * rowH);
          // Horizontal lines (curved)
          ctx.beginPath();
          ctx.ellipse(cx, y, wellW/2, 8, 0, 0, Math.PI); // Half ellipse for front face
          ctx.stroke();
          
          // Vertical lines (staggered)
          const cols = 5;
          const offset = (r % 2 === 0) ? 0 : (wellW/cols)/2;
          for(let c=0; c<cols; c++) {
              const x = (cx - wellW/2) + (c * (wellW/cols)) + offset;
              if (x < cx + wellW/2 - 5 && x > cx - wellW/2 + 5) {
                  ctx.beginPath();
                  ctx.moveTo(x, y);
                  ctx.lineTo(x, y + rowH);
                  ctx.stroke();
              }
          }
      }

      // 5. Crumbling/Moss Details
      ctx.fillStyle = '#558b2f'; // Dry moss
      ctx.globalAlpha = 0.6;
      ctx.beginPath(); ctx.arc(cx - 30, bottomY - 10, 10, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 20, wellY + 10, 5, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1.0;

      // 6. Sand Drift (The "Buried" look)
      // Matches the desert ground colors
      const sandGrd = ctx.createLinearGradient(0, bottomY - 20, 0, H);
      sandGrd.addColorStop(0, '#795548'); 
      sandGrd.addColorStop(1, '#3e2723'); 
      ctx.fillStyle = sandGrd;

      ctx.beginPath();
      ctx.moveTo(0, H);
      // Slope up left side
      ctx.quadraticCurveTo(cx - 40, bottomY - 25, cx, bottomY - 10);
      // Slope down right side
      ctx.quadraticCurveTo(cx + 50, bottomY, W, H);
      ctx.lineTo(0, H);
      ctx.fill();

      // Sand noise
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      for(let i=0; i<100; i++) {
          ctx.fillRect(Math.random()*W, bottomY - 20 + Math.random()*20, 2, 2);
      }

      canvas.refresh();
  }
}
