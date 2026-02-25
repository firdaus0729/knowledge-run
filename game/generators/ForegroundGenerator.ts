
import Phaser from 'phaser';
import { CityGate } from '../objects/CityGate';

export class ForegroundGenerator {
    static init(scene: Phaser.Scene) {
        // --- CITY ELEMENTS ---
        this.generateLanternPostTexture(scene);
        this.generateLampLightTexture(scene);
        this.generateStringLightsTexture(scene);
        this.generateHangingLampTexture(scene);
        this.generateSilhouetteWallTexture(scene);
        this.generateVentTexture(scene);
        this.generatePurplePillarTexture(scene);
        this.generateArchTexture(scene);
        
        this.generateAwningTexture(scene);
        this.generateCarpetRackTexture(scene);
        this.generatePotteryTexture(scene);
        this.generateSpiceBasketTexture(scene);
        
        // City Near Layer
        this.generateHugeArchSilhouette(scene);
        this.generateMarketStallSilhouette(scene);
        this.generateHangingLaundry(scene);
        this.generatePalaceCorner(scene);
        this.generateNearRug(scene);
        this.generateNearPalm(scene);
        this.generateNearCrates(scene);
        this.generateNearLanternCluster(scene);

        // --- DESERT ELEMENTS ---
        this.generateDesertRockCluster(scene);
        this.generateDeadBush(scene);
        this.generateRuinedColumn(scene);
        this.generateDesertBones(scene);
        this.generateDesertCrate(scene);

        // --- LIBRARY ELEMENTS (NEW) ---
        this.generateFloatingScroll(scene);
        this.generateBookStack(scene);

        // City Gate
        CityGate.generateTexture(scene);
    }

    // --- LIBRARY GENERATORS ---

    private static generateFloatingScroll(scene: Phaser.Scene) {
        if (scene.textures.exists('fg_scroll')) return;
        const W = 120, H = 100;
        const canvas = scene.textures.createCanvas('fg_scroll', W, H);
        if (!canvas) return;
        const ctx = canvas.context;

        // Paper
        ctx.fillStyle = '#fff9c4'; 
        ctx.beginPath();
        // S-Curve scroll shape
        ctx.moveTo(20, 20); // Top left roll
        ctx.quadraticCurveTo(60, 40, 100, 20); // Top edge
        ctx.lineTo(100, 80); // Right edge
        ctx.quadraticCurveTo(60, 100, 20, 80); // Bottom edge
        ctx.lineTo(20, 20);
        ctx.fill();
        
        // Outline
        ctx.strokeStyle = '#fbc02d';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Runes / Text
        ctx.fillStyle = '#5d4037';
        for(let i=0; i<3; i++) {
            ctx.fillRect(30, 35 + i*15, 60, 2);
        }
        
        // Glow effect is handled by game object sprite logic (blend mode)
        canvas.refresh();
    }

    private static generateBookStack(scene: Phaser.Scene) {
        if (scene.textures.exists('fg_book_stack')) return;
        const W = 80, H = 100;
        const canvas = scene.textures.createCanvas('fg_book_stack', W, H);
        if (!canvas) return;
        const ctx = canvas.context;

        const drawBook = (x: number, y: number, w: number, h: number, color: string) => {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, w, h);
            // Spine
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillRect(x, y, 5, h);
            // Pages
            ctx.fillStyle = '#fffde7';
            ctx.fillRect(x+5, y+2, w-7, h-4);
        };

        // Stack of 3 books
        drawBook(10, 70, 60, 15, '#d32f2f'); // Bottom Red
        drawBook(15, 55, 50, 15, '#1976d2'); // Mid Blue
        drawBook(20, 40, 40, 15, '#388e3c'); // Top Green

        canvas.refresh();
    }

    // --- DESERT GENERATORS ---

    private static generateDesertRockCluster(scene: Phaser.Scene) {
        if (scene.textures.exists('fg_desert_rocks')) return;
        const W = 300, H = 200;
        const canvas = scene.textures.createCanvas('fg_desert_rocks', W, H);
        if (!canvas) return;
        const ctx = canvas.context;

        // Dark Silhouette for Foreground
        const grd = ctx.createLinearGradient(0, 0, 0, H);
        grd.addColorStop(0, '#1a1412');
        grd.addColorStop(1, '#000000');
        ctx.fillStyle = grd;

        // Rock 1 (Large Left)
        ctx.beginPath();
        ctx.moveTo(0, H);
        ctx.lineTo(10, H-120);
        ctx.lineTo(60, H-150);
        ctx.lineTo(120, H-80);
        ctx.lineTo(150, H);
        ctx.fill();

        // Rock 2 (Small Right)
        ctx.beginPath();
        ctx.moveTo(130, H);
        ctx.lineTo(160, H-60);
        ctx.lineTo(200, H-90);
        ctx.lineTo(250, H-40);
        ctx.lineTo(300, H);
        ctx.fill();

        // Highlight Edges (Moonlight)
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(10, H-120); ctx.lineTo(60, H-150); ctx.lineTo(120, H-80);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(160, H-60); ctx.lineTo(200, H-90); ctx.lineTo(250, H-40);
        ctx.stroke();

        canvas.refresh();
    }

    private static generateDeadBush(scene: Phaser.Scene) {
        if (scene.textures.exists('fg_dead_bush')) return;
        const W = 150, H = 150;
        const canvas = scene.textures.createCanvas('fg_dead_bush', W, H);
        if (!canvas) return;
        const ctx = canvas.context;

        ctx.strokeStyle = '#0a0806'; // Nearly black
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        const startX = W/2;
        const startY = H;

        const drawBranch = (x: number, y: number, len: number, angle: number, width: number) => {
            if (len < 10) return;
            const endX = x + Math.cos(angle) * len;
            const endY = y + Math.sin(angle) * len;
            
            ctx.lineWidth = width;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            // Branch out
            drawBranch(endX, endY, len * 0.7, angle - 0.5, width * 0.7);
            drawBranch(endX, endY, len * 0.7, angle + 0.5, width * 0.7);
        };

        drawBranch(startX, startY, 50, -Math.PI/2, 4);
        
        canvas.refresh();
    }

    private static generateRuinedColumn(scene: Phaser.Scene) {
        if (scene.textures.exists('fg_ruined_column')) return;
        const W = 100, H = 300;
        const canvas = scene.textures.createCanvas('fg_ruined_column', W, H);
        if (!canvas) return;
        const ctx = canvas.context;

        const grd = ctx.createLinearGradient(0, 0, W, 0);
        grd.addColorStop(0, '#0f0b0d');
        grd.addColorStop(1, '#1c1614');
        ctx.fillStyle = grd;

        // Broken Shaft
        ctx.beginPath();
        ctx.moveTo(10, H);
        ctx.lineTo(15, H-200); // Slight taper
        // Jagged break at top
        ctx.lineTo(30, H-220);
        ctx.lineTo(40, H-190);
        ctx.lineTo(60, H-210);
        ctx.lineTo(85, H-190);
        ctx.lineTo(90, H);
        ctx.fill();

        // Cracks
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(30, H-220); ctx.lineTo(40, H-150); ctx.lineTo(35, H-100);
        ctx.stroke();

        canvas.refresh();
    }

    private static generateDesertBones(scene: Phaser.Scene) {
        if (scene.textures.exists('fg_bones')) return;
        const W = 200, H = 150;
        const canvas = scene.textures.createCanvas('fg_bones', W, H);
        if (!canvas) return;
        const ctx = canvas.context;

        ctx.fillStyle = '#1a1412'; // Dark silhouette
        
        // Ribcage emerging from sand
        for(let i=0; i<4; i++) {
            const h = 60 + (i%2)*20;
            const x = 40 + i*40;
            
            ctx.beginPath();
            ctx.moveTo(x, H);
            ctx.quadraticCurveTo(x - 10, H - h, x + 30, H - h - 10); // Curve in
            ctx.quadraticCurveTo(x + 20, H - h + 5, x + 10, H);
            ctx.fill();
        }

        canvas.refresh();
    }

    private static generateDesertCrate(scene: Phaser.Scene) {
        if (scene.textures.exists('fg_desert_crate')) return;
        const W = 100, H = 90;
        const canvas = scene.textures.createCanvas('fg_desert_crate', W, H);
        if (!canvas) return;
        const ctx = canvas.context;
        // Wooden crate/box silhouette - weathered desert style
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(15, 50, 70, 40);
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(20, 30, 60, 25);
        ctx.fillRect(25, 10, 50, 25);
        ctx.strokeStyle = '#2d1f1b';
        ctx.lineWidth = 2;
        ctx.strokeRect(15, 50, 70, 40);
        ctx.strokeRect(20, 30, 60, 25);
        ctx.strokeRect(25, 10, 50, 25);
        canvas.refresh();
    }

    // --- CITY GENERATORS (Existing preserved) ---

    private static generateHugeArchSilhouette(scene: Phaser.Scene) {
        if (scene.textures.exists('fg_near_arch')) return;
        const W = 400; const H = 800;
        const canvas = scene.textures.createCanvas('fg_near_arch', W, H);
        if (!canvas) return;
        const ctx = canvas.context;
        const grd = ctx.createLinearGradient(0, 0, 0, H);
        grd.addColorStop(0, '#0a0a0e'); grd.addColorStop(1, '#15101e');
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.bezierCurveTo(W, 150, 180, 100, 180, 400); 
        ctx.lineTo(150, H); ctx.lineTo(0, H); ctx.fill();
        ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = '#000';
        const drawWindow = (dx: number, dy: number) => {
            ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx + 15, dy + 15); ctx.lineTo(dx + 15, dy + 80);
            ctx.lineTo(dx - 15, dy + 80); ctx.lineTo(dx - 15, dy + 15); ctx.lineTo(dx, dy); ctx.fill();
        };
        drawWindow(70, 150); drawWindow(70, 300); drawWindow(70, 450);
        ctx.globalCompositeOperation = 'source-over';
        canvas.refresh();
    }

    private static generateMarketStallSilhouette(scene: Phaser.Scene) {
        if (scene.textures.exists('fg_near_market')) return;
        const W = 500; const H = 400;
        const canvas = scene.textures.createCanvas('fg_near_market', W, H);
        if (!canvas) return;
        const ctx = canvas.context;
        const grd = ctx.createLinearGradient(0, 0, 0, H);
        grd.addColorStop(0, '#0f0b15'); grd.addColorStop(1, '#1a1625');
        ctx.fillStyle = grd;
        ctx.fillRect(40, 20, 25, H); ctx.fillRect(W-40, 20, 25, H); ctx.fillRect(20, 40, W-40, 20); 
        ctx.beginPath(); ctx.moveTo(65, 60); ctx.lineTo(120, 40); ctx.lineTo(65, 40); 
        ctx.moveTo(W-65, 60); ctx.lineTo(W-120, 40); ctx.lineTo(W-65, 40); ctx.fill();
        canvas.refresh();
    }

    private static generateHangingLaundry(scene: Phaser.Scene) {
        if (scene.textures.exists('fg_near_laundry')) return;
        const W = 600; const H = 400; 
        const canvas = scene.textures.createCanvas('fg_near_laundry', W, H);
        if (!canvas) return;
        const ctx = canvas.context;
        ctx.strokeStyle = '#0a0a0e'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(10, 60); ctx.quadraticCurveTo(W/2, 160, W-10, 60); ctx.lineTo(W, 0); ctx.stroke();
        canvas.refresh();
    }

    private static generatePalaceCorner(scene: Phaser.Scene) {
        if (scene.textures.exists('fg_near_pillar')) return;
        const W = 150; const H = 800;
        const canvas = scene.textures.createCanvas('fg_near_pillar', W, H);
        if (!canvas) return;
        const ctx = canvas.context;
        const grd = ctx.createLinearGradient(0, 0, W, 0);
        grd.addColorStop(0, '#050508'); grd.addColorStop(1, '#1b1b26');
        ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
        canvas.refresh();
    }

    private static generateNearRug(scene: Phaser.Scene) {
        if (scene.textures.exists('fg_near_rug')) return;
        const W = 200, H = 600;
        const canvas = scene.textures.createCanvas('fg_near_rug', W, H);
        if (!canvas) return;
        const ctx = canvas.context;
        const grd = ctx.createLinearGradient(0, 0, 0, H);
        grd.addColorStop(0, '#0a0a0e'); grd.addColorStop(1, '#1a1625');
        ctx.fillStyle = grd; ctx.fillRect(0, 0, W, 20);
        ctx.beginPath(); ctx.moveTo(20, 20); ctx.lineTo(W-20, 20); ctx.lineTo(W-10, H-50); ctx.lineTo(10, H-50); ctx.fill();
        canvas.refresh();
    }

    private static generateNearPalm(scene: Phaser.Scene) {
        if (scene.textures.exists('fg_near_palm')) return;
        const W = 500; const H = 800;
        const canvas = scene.textures.createCanvas('fg_near_palm', W, H);
        if (!canvas) return;
        const ctx = canvas.context;
        const grd = ctx.createLinearGradient(0, 0, 0, H);
        grd.addColorStop(0, '#0a0a0e'); grd.addColorStop(1, '#1b1b26'); 
        ctx.fillStyle = grd; ctx.strokeStyle = grd;
        ctx.beginPath(); ctx.moveTo(W - 10, H); ctx.quadraticCurveTo(W - 50, H/2, W - 130, 200);
        ctx.lineTo(W - 170, 200); ctx.lineTo(W - 50, H); ctx.fill();
        canvas.refresh();
    }

    private static generateNearCrates(scene: Phaser.Scene) {
        if (scene.textures.exists('fg_near_crates')) return;
        const W = 300, H = 300;
        const canvas = scene.textures.createCanvas('fg_near_crates', W, H);
        if (!canvas) return;
        const ctx = canvas.context;
        const grd = ctx.createLinearGradient(0, 0, 0, H);
        grd.addColorStop(0, '#0f0b15'); grd.addColorStop(1, '#1a1625');
        ctx.fillStyle = grd;
        ctx.fillRect(100, 150, 150, 150); ctx.fillRect(0, 200, 120, 100); ctx.fillRect(80, 50, 100, 120);
        canvas.refresh();
    }

    private static generateNearLanternCluster(scene: Phaser.Scene) {
        if (scene.textures.exists('fg_near_lanterns')) return;
        const W = 200, H = 400;
        const canvas = scene.textures.createCanvas('fg_near_lanterns', W, H);
        if (!canvas) return;
        const ctx = canvas.context;
        const grd = ctx.createLinearGradient(0, 0, 0, H);
        grd.addColorStop(0, '#0f0b15'); grd.addColorStop(1, '#1a1625');
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(50+15, 100+15, 15, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(150+20, 180+20, 20, 0, Math.PI*2); ctx.fill();
        canvas.refresh();
    }

    // --- STANDARD FOREGROUND GENERATORS ---

    private static generateSilhouetteWallTexture(scene: Phaser.Scene) {
        if (scene.textures.exists('fg_silhouette_wall')) return;
        const W = 220; const H = 800; 
        const canvas = scene.textures.createCanvas('fg_silhouette_wall', W, H);
        if(!canvas) return;
        const ctx = canvas.context;
        const grd = ctx.createLinearGradient(0, 0, W, 0);
        grd.addColorStop(0, '#0d0d12'); grd.addColorStop(1, '#1b1b26'); 
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, 0); ctx.lineTo(W-20, 0);
        ctx.lineTo(W, 100); ctx.lineTo(W-10, 200); ctx.lineTo(W, 300);
        ctx.lineTo(W-15, 450); ctx.lineTo(W, H); ctx.fill();
        canvas.refresh();
    }
  
    private static generateAwningTexture(scene: Phaser.Scene) {
        if (scene.textures.exists('fg_awning')) return;
        const W = 340, H = 140;
        const canvas = scene.textures.createCanvas('fg_awning', W, H);
        if(!canvas) return;
        const ctx = canvas.context;
        const isRed = Math.random() > 0.5;
        const cPrimary = isRed ? '#c62828' : '#2e7d32';
        const cSecondary = '#fafafa';
        const stripeW = 34;
        ctx.save();
        for(let i=0; i < W/stripeW + 1; i++) {
            ctx.fillStyle = (i % 2 === 0) ? cPrimary : cSecondary;
            ctx.fillRect(i * stripeW, 0, stripeW, H - 20);
            ctx.beginPath(); ctx.arc(i * stripeW + stripeW/2, H - 20, stripeW/2, 0, Math.PI); ctx.fill();
        }
        ctx.restore();
        canvas.refresh();
    }
  
    private static generateCarpetRackTexture(scene: Phaser.Scene) {
        if (scene.textures.exists('fg_carpet_rack')) return;
        const W = 160, H = 220;
        const canvas = scene.textures.createCanvas('fg_carpet_rack', W, H);
        if(!canvas) return;
        const ctx = canvas.context;
        ctx.fillStyle = '#4e342e'; 
        ctx.fillRect(20, 20, 12, H-20); ctx.fillRect(W-32, 20, 12, H-20);
        ctx.fillRect(10, H-10, 32, 10); ctx.fillRect(W-42, H-10, 32, 10);
        ctx.fillRect(10, 20, W-20, 12);
        canvas.refresh();
    }
  
    private static generatePotteryTexture(scene: Phaser.Scene) {
        if (scene.textures.exists('fg_pottery')) return;
        const W = 140, H = 100;
        const canvas = scene.textures.createCanvas('fg_pottery', W, H);
        if(!canvas) return;
        const ctx = canvas.context;
        const drawPot = (px: number, py: number, w: number, h: number, color: string) => {
            ctx.fillStyle = color;
            ctx.beginPath(); ctx.ellipse(px, py - h/2, w/2, h/2, 0, 0, Math.PI*2); ctx.fill();
            ctx.fillRect(px - w/3, py - h, w/1.5, h/4);
        };
        drawPot(70, H-5, 50, 80, '#5d4037'); drawPot(35, H, 60, 60, '#8d6e63'); drawPot(105, H, 40, 50, '#a1887f');
        canvas.refresh();
    }
  
    private static generateSpiceBasketTexture(scene: Phaser.Scene) {
        if (scene.textures.exists('fg_spices')) return;
        const W = 120, H = 70;
        const canvas = scene.textures.createCanvas('fg_spices', W, H);
        if(!canvas) return;
        const ctx = canvas.context;
        const drawBasket = (bx: number, by: number, w: number, h: number, spiceColor: string) => {
            ctx.fillStyle = '#d7ccc8';
            ctx.beginPath(); ctx.moveTo(bx - w/2 + 5, by); ctx.lineTo(bx - w/2, by - h);
            ctx.lineTo(bx + w/2, by - h); ctx.lineTo(bx + w/2 - 5, by); ctx.fill();
            ctx.fillStyle = spiceColor;
            ctx.beginPath(); ctx.moveTo(bx - w/2 + 2, by - h);
            ctx.quadraticCurveTo(bx, by - h - 20, bx + w/2 - 2, by - h); ctx.fill();
        };
        drawBasket(60, H-5, 40, 30, '#fbc02d'); drawBasket(30, H, 35, 25, '#d32f2f'); drawBasket(90, H, 35, 25, '#e64a19');
        canvas.refresh();
    }
  
    private static generatePurplePillarTexture(scene: Phaser.Scene) {
      if (scene.textures.exists('fg_pillar_purple')) return;
      const w = 240, h = 1400; 
      const canvas = scene.textures.createCanvas('fg_pillar_purple', w, h);
      if (!canvas) return;
      const ctx = canvas.context;
      const pW = 120, pX = (w - pW) / 2;
      const grd = ctx.createLinearGradient(pX, 0, pX + pW, 0);
      grd.addColorStop(0, '#2d2640'); grd.addColorStop(1, '#241d33');    
      ctx.fillStyle = grd; ctx.fillRect(pX, 0, pW, h);
      canvas.refresh();
    }
  
    private static generateHangingLampTexture(scene: Phaser.Scene) {
        if (scene.textures.exists('fg_hanging_lamp')) return;
        const w = 64, h = 90; 
        const canvas = scene.textures.createCanvas('fg_hanging_lamp', w, h);
        const ctx = canvas.context;
        const cx = w/2;
        ctx.fillStyle = '#151515';
        ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx + 15, 20); ctx.lineTo(cx + 12, 60); 
        ctx.lineTo(cx, 85); ctx.lineTo(cx - 12, 60); ctx.lineTo(cx - 15, 20); ctx.closePath(); ctx.fill();
        canvas.refresh();
        if (!scene.textures.exists('fg_chain')) {
            const chainCanvas = scene.textures.createCanvas('fg_chain', 6, 16);
            const cCtx = chainCanvas.context;
            cCtx.strokeStyle = '#111'; cCtx.lineWidth = 2;
            cCtx.beginPath(); cCtx.moveTo(3, 0); cCtx.lineTo(3, 16); cCtx.stroke();
            chainCanvas.refresh();
        }
    }
  
    private static generateVentTexture(scene: Phaser.Scene) {
        if (scene.textures.exists('fg_vent')) return;
        const w = 80, h = 100;
        const canvas = scene.textures.createCanvas('fg_vent', w, h);
        const ctx = canvas.context;
        ctx.fillStyle = '#1a1a1a'; ctx.fillRect(10, 40, 60, 60); 
        canvas.refresh();
    }
  
    private static generateStringLightsTexture(scene: Phaser.Scene) {
        if (scene.textures.exists('fg_string_lights')) return;
        
        // Canvas Setup
        const W = 400;
        const H = 150; // Reduced height to fit the curve tightly
        const canvas = scene.textures.createCanvas('fg_string_lights', W, H);
        if (!canvas) return;
        const ctx = canvas.context;
        
        ctx.strokeStyle = '#000'; 
        ctx.lineWidth = 3;
        
        // Define exact curve parameters used for bulb placement
        const startX = 20;
        const startY = 20;
        const endX = 380;
        const endY = 20;
        const cpX = W/2;
        const cpY = 100; // Dip point
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(cpX, cpY, endX, endY);
        ctx.stroke();
        
        canvas.refresh();
    }
  
    private static generateLampLightTexture(scene: Phaser.Scene) {
        if (scene.textures.exists('fg_lamp_light')) return;
        const size = 128;
        const canvas = scene.textures.createCanvas('fg_lamp_light', size, size);
        if (!canvas) return;
        const ctx = canvas.context;
        const cx = size/2;
        const grd = ctx.createRadialGradient(cx, cx, 2, cx, cx, 60);
        grd.addColorStop(0, '#fffde7'); grd.addColorStop(1, 'rgba(0,0,0,0)'); 
        ctx.fillStyle = grd; ctx.fillRect(0,0,size,size);
        canvas.refresh();
    }
  
    private static generateLanternPostTexture(scene: Phaser.Scene) {
        if (scene.textures.exists('fg_lantern_post')) return;
        const W = 100, H = 450;
        const canvas = scene.textures.createCanvas('fg_lantern_post', W, H);
        if (!canvas) return;
        const ctx = canvas.context;
        ctx.fillStyle = '#111'; ctx.fillRect(45, 50, 10, H-50);
        canvas.refresh();
    }
  
    private static generateArchTexture(scene: Phaser.Scene) {
        if (scene.textures.exists('fg_arch')) return;
        const W = 300; const H = 700; 
        const canvas = scene.textures.createCanvas('fg_arch', W, H);
        if (!canvas) return;
        const ctx = canvas.context;
        const grad = ctx.createLinearGradient(0, H, 0, 0);
        grad.addColorStop(0, '#050508'); grad.addColorStop(1, '#1a1625'); 
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.moveTo(30, H); ctx.lineTo(70, H); ctx.lineTo(70, 150);
        ctx.bezierCurveTo(70, -20, W-70, -20, W-70, 150);
        ctx.lineTo(W-70, H); ctx.lineTo(W-30, H); ctx.lineTo(W-30, 150);
        ctx.bezierCurveTo(W, -80, 0, -80, 30, 150); ctx.closePath(); ctx.fill();
        canvas.refresh();
    }
  }
