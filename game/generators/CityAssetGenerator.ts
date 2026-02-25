
import Phaser from 'phaser';

export class CityAssetGenerator {
    static init(scene: Phaser.Scene) {
        this.generateCitySkyline(scene);
        this.generateNearRooftops(scene);
    }

    // LAYER 2: City Skyline (The Main Background)
    private static generateCitySkyline(scene: Phaser.Scene) {
        if (scene.textures.exists('cityMid')) return;
        
        const W = 2048;
        const H = 1024; // Doubled height to allow "foundation" stretch
        const HORIZON = 512; // The visual ground line within the texture

        const canvas = scene.textures.createCanvas('cityMid', W, H);
        const lCanvas = scene.textures.createCanvas('cityLights', W, H);
        if (!canvas || !lCanvas) return;
        
        const ctx = canvas.context;
        const lCtx = lCanvas.context;

        // --- PALETTE: Vibrant Royal Night ---
        const Pal = {
            WallBase:   '#5e35b1', // Deep Purple (Vibrant)
            WallDark:   '#311b92', // Deep Indigo Shadow
            WallShadow: '#280659', // Darkest Purple
            DomeBase:   '#8e24aa', // Rich Violet/Orchid
            DomeDark:   '#4a148c', // Deep Purple
            Gold:       '#ffca28', // Bright Amber Gold
            Window:     '#ffeb3b', // Bright Yellow Light
            Accent:     '#00e5ff'  // Cyan Accent
        };

        // --- DRAWING HELPERS ---

        const drawDome = (x: number, y: number, w: number, h: number) => {
            ctx.save();
            
            // 1. Dome Shape (Bulbous Onion)
            ctx.beginPath();
            ctx.moveTo(x, y);
            // Bulge out logic
            ctx.bezierCurveTo(x - w*0.15, y - h*0.6, x - w*0.3, y - h*0.9, x + w/2, y - h); // Left side
            ctx.bezierCurveTo(x + w + w*0.3, y - h*0.9, x + w + w*0.15, y - h*0.6, x + w, y); // Right side
            ctx.closePath();
            
            // 3D Gradient Fill
            const grd = ctx.createLinearGradient(x, y-h, x + w, y);
            grd.addColorStop(0, Pal.DomeBase);
            grd.addColorStop(1, Pal.DomeDark);
            ctx.fillStyle = grd;
            ctx.fill();

            // 2. Specular Highlight (Shiny surface)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.ellipse(x + w*0.3, y - h*0.6, w*0.15, h*0.2, -0.5, 0, Math.PI*2);
            ctx.fill();

            // 3. Gold Spire (Top)
            ctx.fillStyle = Pal.Gold;
            ctx.beginPath();
            ctx.moveTo(x + w/2 - 2, y - h);
            ctx.lineTo(x + w/2 + 2, y - h);
            ctx.lineTo(x + w/2, y - h - 25);
            ctx.fill();
            // Crescent Moon on top
            ctx.beginPath(); ctx.arc(x + w/2, y - h - 25, 5, 0, Math.PI*2); ctx.fill();

            // 4. Base Rim (Connection to roof)
            ctx.fillStyle = Pal.WallShadow;
            ctx.fillRect(x + w*0.1, y - 4, w*0.8, 4);

            ctx.restore();
        };

        const drawDecorativeBand = (x: number, y: number, w: number, type: 'zigzag' | 'dots' | 'lines') => {
            ctx.save();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; 
            
            if (type === 'zigzag') {
                ctx.beginPath();
                ctx.moveTo(x, y);
                for(let i=0; i<w; i+=10) {
                    ctx.lineTo(x + i + 5, y + 5);
                    ctx.lineTo(x + i + 10, y);
                }
                ctx.lineTo(x + w, y);
                ctx.lineTo(x + w, y+2); 
                ctx.strokeStyle = 'rgba(0,0,0,0.2)';
                ctx.lineWidth = 2;
                ctx.stroke();
            } else if (type === 'dots') {
                for(let i=10; i<w-10; i+=15) {
                    ctx.beginPath(); ctx.arc(x + i, y + 5, 2, 0, Math.PI*2); ctx.fill();
                }
            } else {
                ctx.fillRect(x + 5, y + 2, w - 10, 2);
                ctx.fillRect(x + 5, y + 6, w - 10, 2);
            }
            ctx.restore();
        };

        const drawWindows = (bx: number, by: number, bw: number, bh: number) => {
            lCtx.fillStyle = Pal.Window;
            lCtx.shadowColor = '#ff6f00'; // Orange glow
            lCtx.shadowBlur = 15; 

            // Grid calculation
            const cols = Math.max(1, Math.floor(bw / 40));
            const rows = Math.max(1, Math.floor(bh / 60));
            const padX = (bw - (cols * 20)) / (cols + 1);
            const padY = (bh - (rows * 30)) / (rows + 1);

            for(let r=0; r<rows; r++) {
                for(let c=0; c<cols; c++) {
                    // Randomly skip windows
                    if (Math.random() > 0.5) {
                        const wx = bx + padX + (c * (20 + padX));
                        const wy = by + padY + (r * (30 + padY));
                        
                        // Keyhole Arch Shape
                        lCtx.beginPath();
                        lCtx.arc(wx + 10, wy + 10, 8, Math.PI, 0); // Top circle (smaller)
                        lCtx.rect(wx + 2, wy + 10, 16, 18); // Bottom rect
                        lCtx.fill();
                    }
                }
            }
            lCtx.shadowBlur = 0; // Reset
        };

        const drawBuilding = (x: number, y: number, w: number, h: number, type: 'block' | 'tall') => {
            // 1. Main Body Gradient (Top Part)
            const grd = ctx.createLinearGradient(x, y-h, x, y);
            grd.addColorStop(0, Pal.WallBase);
            grd.addColorStop(1, Pal.WallDark);
            ctx.fillStyle = grd;
            ctx.fillRect(x, y - h, w, h);

            // 2. FOUNDATION STRETCH (The Abyss Fix)
            // Extend the building color downwards to the bottom of the texture
            ctx.fillStyle = Pal.WallDark; 
            ctx.fillRect(x, y, w, H - y); // Fill from Horizon to Bottom

            // 3. Inset Panel (Depth Effect)
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            const margin = 6;
            ctx.fillRect(x + margin, y - h + 15, w - margin*2, h - 15);

            // 4. Roof Crenellations (Merlons)
            ctx.fillStyle = Pal.WallBase;
            const merlonW = 12;
            const merlonH = 10;
            // Draw steps along the top
            for(let mx = x; mx < x + w - 5; mx += merlonW * 1.5) {
                ctx.beginPath();
                ctx.moveTo(mx, y - h);
                ctx.lineTo(mx, y - h - merlonH);
                ctx.lineTo(mx + merlonW, y - h - merlonH);
                ctx.lineTo(mx + merlonW, y - h);
                ctx.fill();
            }

            // 5. Decorative Bands
            drawDecorativeBand(x, y - h + 40, w, 'dots');
            if (h > 150) drawDecorativeBand(x, y - h + 100, w, 'lines');

            // 6. Windows
            drawWindows(x + margin, y - h + 20, w - margin*2, h - 20);
        };

        // --- GENERATION LOOP ---
        let cx = 0;
        // Pre-fill buffer
        while (cx < W) {
            const typeRoll = Math.random();
            const overlap = 4; 

            if (typeRoll < 0.25) {
                // TALL TOWER (Minaret)
                const w = Phaser.Math.Between(40, 60);
                const h = Phaser.Math.Between(300, 450);
                
                drawBuilding(cx, HORIZON, w, h, 'tall');
                
                // Balcony
                ctx.fillStyle = Pal.WallShadow;
                ctx.fillRect(cx - 4, HORIZON - h * 0.7, w + 8, 8);
                
                // Dome Cap
                drawDome(cx + 2, HORIZON - h, w - 4, 30);
                
                cx += w - overlap;
            } 
            else if (typeRoll < 0.6) {
                // LARGE PALACE BLOCK
                const w = Phaser.Math.Between(130, 200);
                const h = Phaser.Math.Between(160, 260);
                
                drawBuilding(cx, HORIZON, w, h, 'block');
                
                // Big Dome on Top
                const domeW = w * 0.7;
                const domeH = domeW * 0.7;
                drawDome(cx + (w - domeW)/2, HORIZON - h, domeW, domeH);
                
                cx += w - overlap;
            } 
            else {
                // SMALL HOUSE CLUSTER
                const w = Phaser.Math.Between(70, 110);
                const h = Phaser.Math.Between(100, 180);
                
                drawBuilding(cx, HORIZON, w, h, 'block');
                
                // Occasional small dome
                if (Math.random() > 0.5) {
                    drawDome(cx + w/4, HORIZON - h, w/2, 25);
                }
                
                cx += w - overlap;
            }
        }

        canvas.refresh();
        lCanvas.refresh();
    }

    // LAYER 3: Near Rooftops (Foreground Silhouette)
    private static generateNearRooftops(scene: Phaser.Scene) {
        if (scene.textures.exists('cityNear')) return;
        const W = 1024;
        const H = 1024; // Increased Height
        const HORIZON = 512;

        const canvas = scene.textures.createCanvas('cityNear', W, H);
        if (!canvas) return;
        const ctx = canvas.context;

        // Rich Indigo Silhouette
        ctx.fillStyle = '#1a237e'; 
        
        let cx = 0;
        while(cx < W) {
            const w = Phaser.Math.Between(100, 250);
            const h = Phaser.Math.Between(50, 120);
            const y = HORIZON;
            
            // Block
            ctx.fillRect(cx, y - h, w, h);
            
            // FOUNDATION EXTENSION
            ctx.fillRect(cx, y, w, H - y); // Fill to bottom

            // Roof Detail
            if (Math.random() > 0.5) {
                // Dome Silhouette
                ctx.beginPath();
                ctx.arc(cx + w/2, y - h, w/4, Math.PI, 0);
                ctx.fill();
            } else {
                // Step Parapet
                for(let i=0; i<w; i+=25) {
                    ctx.fillRect(cx + i, y - h - 10, 15, 10);
                }
            }
            
            // Near Windows (Dim Orange)
            ctx.fillStyle = '#e65100'; 
            if (Math.random() > 0.7) {
                ctx.fillRect(cx + 20, y - h + 20, 20, 30);
            }
            ctx.fillStyle = '#1a237e'; // Reset

            cx += w - 2; 
        }
        canvas.refresh();
    }
}
