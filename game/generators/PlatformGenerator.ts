
import Phaser from 'phaser';

export class PlatformGenerator {
  
  static init(scene: Phaser.Scene) {
      this.generateGroundTexture(scene);
      this.generateCityGroundTexture(scene);
      this.generateFloatingTexture(scene);
      this.generateCliffTextures(scene);
      this.generateCaveFloorTexture(scene);
  }

  // --- HIGH QUALITY STYLIZED SAND TEXTURE ---
  private static drawDirtRoad(ctx: CanvasRenderingContext2D, W: number, H: number) {
      // 1. Base Gradient (Sand to Earth)
      const grd = ctx.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0, '#795548');   // Lighter top edge
      grd.addColorStop(0.1, '#5d4037'); // Main surface color
      grd.addColorStop(1, '#3e2723');   // Shadow bottom
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      // 2. Wind Ripples (The "Sand" look)
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 2;
      
      for(let y=10; y<H; y+=15) {
          ctx.beginPath();
          // Draw a wiggly line across
          for(let x=0; x<=W; x+=20) {
              const yOffset = Math.sin(x * 0.05 + y) * 3;
              if (x===0) ctx.moveTo(x, y + yOffset);
              else ctx.lineTo(x, y + yOffset);
          }
          ctx.stroke();
          
          // Highlight below the shadow line for depth
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.beginPath();
          for(let x=0; x<=W; x+=20) {
              const yOffset = Math.sin(x * 0.05 + y) * 3;
              if (x===0) ctx.moveTo(x, y + yOffset + 2);
              else ctx.lineTo(x, y + yOffset + 2);
          }
          ctx.stroke();
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'; // Reset for next loop
      }

      // 3. Fine Grain Noise (Sand texture)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      for (let i = 0; i < 2000; i++) {
          const x = Math.random() * W;
          const y = Math.random() * H;
          ctx.fillRect(x, y, 1, 1);
      }
      
      // 4. Dark Specks
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      for (let i = 0; i < 1000; i++) {
          const x = Math.random() * W;
          const y = Math.random() * H;
          ctx.fillRect(x, y, 1, 1);
      }

      // 5. Top Edge Highlight (Defined rim)
      ctx.fillStyle = '#a1887f'; // Lighter sand color
      ctx.fillRect(0, 0, W, 4);
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(0, 0, W, 1); // Sharp top highlight

      // 6. Scattered Small Stones (Sparse)
      for (let i = 0; i < 8; i++) {
          const x = Math.random() * W;
          const y = 15 + Math.random() * (H - 30);
          const r = 2 + Math.random() * 3;
          
          // Shadow
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.beginPath(); ctx.arc(x+1, y+1, r, 0, Math.PI*2); ctx.fill();
          
          // Rock
          ctx.fillStyle = '#4e342e'; 
          ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
      }
  }

  // --- CITY PAVEMENT TEXTURE (Amethyst Royal Path) ---
  private static drawCityPavement(ctx: CanvasRenderingContext2D, W: number, H: number) {
      // 1. Amethyst / Violet Stone Base
      const grd = ctx.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0, '#5e35b1'); // Deep Purple Top
      grd.addColorStop(1, '#311b92'); // Dark Indigo Bottom
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      // 2. Geometric Mosaic Pattern
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'; // Subtle grout
      const size = 50;
      
      // Islamic Star Pattern approximation
      for (let y = 0; y < H; y += size) {
          for (let x = 0; x < W; x += size) {
              // Draw alternating diamonds
              ctx.beginPath();
              ctx.moveTo(x + size/2, y);
              ctx.lineTo(x + size, y + size/2);
              ctx.lineTo(x + size/2, y + size);
              ctx.lineTo(x, y + size/2);
              ctx.closePath();
              ctx.stroke();
              
              // Highlight center
              ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
              ctx.fill();
          }
      }

      // 3. Ornate Golden Trim (Top)
      const trimH = 24;
      
      // Shadow under trim
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, trimH, W, 8);

      // Main Gold Band
      const goldGrad = ctx.createLinearGradient(0, 0, 0, trimH);
      goldGrad.addColorStop(0, '#ffd54f'); // Lighter Gold
      goldGrad.addColorStop(0.5, '#ffca28');
      goldGrad.addColorStop(1, '#ff6f00'); // Amber Shadow
      ctx.fillStyle = goldGrad;
      ctx.fillRect(0, 0, W, trimH);

      // Engraved Pattern on Gold
      ctx.fillStyle = '#4a148c'; // Dark Purple inlay (Matches pavement)
      const patternW = 30;
      for (let x = 0; x < W; x += patternW) {
          // Small Arch shape
          ctx.beginPath();
          ctx.arc(x + patternW/2, trimH, 6, Math.PI, 0); 
          ctx.fill();
      }
      
      // Top Highlight shine
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillRect(0, 0, W, 2);
  }

  private static generateCliffTextures(scene: Phaser.Scene) {
      const H = 128;
      const W = 512;

      // Helper to draw realistic stratified rock face
      const drawRockFace = (ctx: CanvasRenderingContext2D, isRightFacing: boolean) => {
          // 1. Clip path for jagged edge
          ctx.beginPath();
          if (isRightFacing) {
              // Cliff face is on the RIGHT side of the image (Left facing wall)
              // Wait, 'ground_cliff_left' means the cliff hole is on the right, so the ground is on the LEFT.
              // So the face is on the RIGHT.
              ctx.moveTo(0, 0);
              ctx.lineTo(W, 0);       
              ctx.lineTo(W - 20, 15);
              ctx.lineTo(W - 45, 30);
              ctx.lineTo(W - 30, 60);
              ctx.lineTo(W - 60, 90);
              ctx.lineTo(W - 40, 128);
              ctx.lineTo(0, 128);
          } else {
              // 'ground_cliff_right': Ground is on RIGHT. Cliff face is on LEFT.
              ctx.moveTo(W, 0);
              ctx.lineTo(0, 0);       
              ctx.lineTo(20, 15);
              ctx.lineTo(45, 30);
              ctx.lineTo(30, 60);
              ctx.lineTo(60, 90);
              ctx.lineTo(40, 128);
              ctx.lineTo(W, 128);
          }
          ctx.closePath();
          
          ctx.save();
          ctx.clip();
          
          // 2. Draw Top Dirt
          this.drawDirtRoad(ctx, W, H);
          
          // 3. Draw Stratified Rock Face (Darker)
          // We apply a gradient that gets darker as it goes down
          const rockGrad = ctx.createLinearGradient(0, 0, 0, H);
          rockGrad.addColorStop(0, 'rgba(62, 39, 35, 0.8)'); // Dark brown top
          rockGrad.addColorStop(1, 'rgba(27, 18, 16, 0.95)'); // Almost black bottom
          
          // We only want to darken the face area, not the top surface
          // Draw a rect covering the whole thing but masked by strata
          
          // Strata lines (Horizontal layers of rock)
          for(let y=10; y<H; y+=8) {
              const layerColor = (y % 16 === 0) ? '#4e342e' : '#3e2723';
              ctx.fillStyle = layerColor;
              
              // Draw irregular layer
              ctx.beginPath();
              ctx.moveTo(0, y);
              for(let x=0; x<=W; x+=20) {
                  ctx.lineTo(x, y + Math.sin(x*0.1 + y)*3);
              }
              ctx.lineTo(W, y + 8);
              ctx.lineTo(0, y + 8);
              ctx.fill();
          }
          
          // Apply Darkening Vignette to the vertical face
          const faceX = isRightFacing ? W : 0;
          const vignette = ctx.createLinearGradient(faceX, 0, isRightFacing ? W-100 : 100, 0);
          vignette.addColorStop(0, 'rgba(0,0,0,0.7)');
          vignette.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = vignette;
          ctx.fillRect(0,0,W,H);

          ctx.restore();

          // 4. Edge Highlight (The Lip)
          ctx.strokeStyle = '#8d6e63'; // Lighter rock color
          ctx.lineWidth = 3;
          ctx.beginPath();
          if (isRightFacing) {
              ctx.moveTo(W, 0); ctx.lineTo(W-20, 15); ctx.lineTo(W-45, 30); 
              ctx.lineTo(W-30, 60); ctx.lineTo(W-60, 90); ctx.lineTo(W-40, 128);
          } else {
              ctx.moveTo(0, 0); ctx.lineTo(20, 15); ctx.lineTo(45, 30); 
              ctx.lineTo(30, 60); ctx.lineTo(60, 90); ctx.lineTo(40, 128);
          }
          ctx.stroke();
      };

      if (!scene.textures.exists('ground_cliff_left')) {
          const c1 = scene.textures.createCanvas('ground_cliff_left', W, H);
          if(c1) {
              drawRockFace(c1.context, true);
              c1.refresh();
          }
      }

      if (!scene.textures.exists('ground_cliff_right')) {
          const c2 = scene.textures.createCanvas('ground_cliff_right', W, H);
          if(c2) {
              drawRockFace(c2.context, false);
              c2.refresh();
          }
      }
  }

  // --- FLOATING WOODEN SCAFFOLD ---
  private static generateFloatingTexture(scene: Phaser.Scene) {
    if (scene.textures.exists('floating_plat')) return;
    const W = 160;
    const H = 54;
    const canvas = scene.textures.createCanvas('floating_plat', W, H);
    if (!canvas) return;
    const ctx = canvas.context;
    
    // 1. Wood Planks (Top Surface)
    const plankH = 14;
    ctx.fillStyle = '#5d4037'; // Dark wood base
    ctx.fillRect(0, 0, W, plankH);
    
    // Individual Planks
    for(let x=0; x<W; x+=20) {
        ctx.fillStyle = (x/20)%2===0 ? '#795548' : '#6d4c41';
        ctx.fillRect(x, 0, 20, plankH);
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(x+18, 0, 2, plankH);
        ctx.fillStyle = '#3e2723';
        ctx.beginPath(); ctx.arc(x+10, 3, 1.5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(x+10, plankH-3, 1.5, 0, Math.PI*2); ctx.fill();
    }
    
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(0, 0, W, 2);

    // 2. Support Beams
    const beamColor = '#4e342e';
    ctx.fillStyle = beamColor;
    ctx.fillRect(10, plankH, W-20, 8);
    
    ctx.strokeStyle = beamColor;
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(20, plankH + 4); ctx.lineTo(40, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W-20, plankH + 4); ctx.lineTo(W-40, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W/2, plankH); ctx.lineTo(W/2, H-10); ctx.stroke();

    // 3. Rope Lashings
    ctx.strokeStyle = '#e6bf75'; 
    ctx.lineWidth = 2;
    const drawLash = (lx: number, ly: number) => {
        ctx.beginPath(); 
        ctx.moveTo(lx-3, ly); ctx.lineTo(lx+3, ly+4);
        ctx.moveTo(lx-3, ly+3); ctx.lineTo(lx+3, ly+7);
        ctx.stroke();
    };
    drawLash(20, plankH);
    drawLash(W-20, plankH);
    drawLash(W/2, plankH);
    
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowOffsetY = 5;
    
    canvas.refresh();
  }

  private static generateGroundTexture(scene: Phaser.Scene) {
    if (scene.textures.exists('ground')) return;
    const W = 1024;
    const H = 128;
    const canvas = scene.textures.createCanvas('ground', W, H);
    if (!canvas) return;
    const ctx = canvas.context;
    this.drawDirtRoad(ctx, W, H);
    canvas.refresh();
  }

  private static generateCityGroundTexture(scene: Phaser.Scene) {
    if (scene.textures.exists('ground_city')) return;
    const W = 1024;
    const H = 128;
    const canvas = scene.textures.createCanvas('ground_city', W, H);
    if (!canvas) return;
    const ctx = canvas.context;
    this.drawCityPavement(ctx, W, H);
    canvas.refresh();
  }

  private static generateCaveFloorTexture(scene: Phaser.Scene) {
      if (scene.textures.exists('cave_floor')) return;
      const W = 512;
      const H = 128;
      const canvas = scene.textures.createCanvas('cave_floor', W, H);
      if (!canvas) return;
      const ctx = canvas.context;

      const grd = ctx.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0, '#21120e'); 
      grd.addColorStop(1, '#000000');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = '#3e2723';
      for(let i=0; i<40; i++) {
          const x = Math.random() * W;
          const y = Math.random() * (H/2);
          const s = 5 + Math.random() * 15;
          ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI*2); ctx.fill();
      }

      ctx.fillStyle = '#1a100d'; 
      ctx.fillRect(0, 0, W, 4);
      
      canvas.refresh();
  }
}
