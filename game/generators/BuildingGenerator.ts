
import Phaser from 'phaser';

export class BuildingGenerator {
    static init(scene: Phaser.Scene) {
      this.generateMarketBuilding(scene, 'building_stall_A', '#c62828', '#ef9a9a', 'fruit'); // Red (Fruit)
      this.generateMarketBuilding(scene, 'building_stall_B', '#1565c0', '#90caf9', 'pottery'); // Blue (Pottery)
      this.generateMarketBuilding(scene, 'building_stall_C', '#2e7d32', '#a5d6a7', 'spices'); // Green (Spices)
      
      this.generatePotteryBuilding(scene);
      this.generateRugBuilding(scene);
      this.generateLibraryExterior(scene);
    }

    // --- SHARED HELPERS ---
    
    private static drawMudbrickTexture(ctx: CanvasRenderingContext2D, width: number, height: number, baseColor: string) {
        // Base Wall
        const grd = ctx.createLinearGradient(0, 0, 0, height);
        grd.addColorStop(0, baseColor); 
        // Darker at bottom for grounding
        grd.addColorStop(1, this.adjustColor(baseColor, -40)); 
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, width, height);

        // Texture Noise (Mudbrick feel)
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        for(let i=0; i<800; i++) {
            ctx.fillRect(Math.random()*width, Math.random()*height, 2 + Math.random()*4, 2);
        }
        
        // Exposed Bricks (Patches)
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        const patchCount = 3;
        for(let i=0; i<patchCount; i++) {
            const bx = Math.random() * (width - 40);
            const by = Math.random() * (height - 40);
            for(let r=0; r<3; r++) {
                for(let c=0; c<3; c++) {
                    if (Math.random() > 0.3) {
                        ctx.fillRect(bx + c*12, by + r*8, 10, 6);
                    }
                }
            }
        }
    }

    private static drawVigas(ctx: CanvasRenderingContext2D, x: number, y: number, width: number) {
        // Exposed wooden beam ends near roof
        ctx.fillStyle = '#3e2723';
        const beamSize = 10;
        const spacing = 30;
        for (let i = x + 15; i < x + width - 15; i += spacing) {
            ctx.beginPath();
            ctx.arc(i, y, beamSize/2, 0, Math.PI*2);
            ctx.fill();
            // Shadow under beam
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath(); ctx.arc(i, y+2, beamSize/2, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#3e2723'; // Reset
        }
    }

    private static adjustColor(color: string, amount: number) {
        return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
    }

    // --- LIBRARY EXTERIOR ---
    private static generateLibraryExterior(scene: Phaser.Scene) {
        if (scene.textures.exists('library_exterior')) return;
        
        const W = 600, H = 700; // Grand Scale
        const canvas = scene.textures.createCanvas('library_exterior', W, H);
        if (!canvas) return;
        const ctx = canvas.context;

        const cx = W / 2;

        // --- 1. Main Structure (Marble/Stone) ---
        const wallGrd = ctx.createLinearGradient(0, 0, 0, H);
        wallGrd.addColorStop(0, '#fdfbf7'); // Cream White
        wallGrd.addColorStop(1, '#d7ccc8'); // Stone Grey/Brown
        ctx.fillStyle = wallGrd;
        
        // Base block
        ctx.fillRect(50, 200, W - 100, H - 200);
        
        // --- 2. The Grand Archway (Entrance) ---
        const archW = 280;
        const archH = 420;
        const archY = H;
        const archTopY = archY - archH;
        
        // --- INTERIOR BOOKSHELVES (The "Library" Look) ---
        // Fill the arch background first
        ctx.fillStyle = '#261a15'; // Dark Wood interior
        
        // Define Arch Path
        ctx.beginPath();
        ctx.moveTo(cx - archW/2, archY);
        ctx.lineTo(cx - archW/2, archTopY + 50);
        ctx.quadraticCurveTo(cx - archW/2, archTopY, cx, archTopY); // Rounded Top
        ctx.quadraticCurveTo(cx + archW/2, archTopY, cx + archW/2, archTopY + 50);
        ctx.lineTo(cx + archW/2, archY);
        ctx.fill();

        // Draw Shelves & Books inside the arch
        ctx.save();
        ctx.clip(); // Clip drawing to the arch shape

        const shelfH = 40;
        const startShelfY = archTopY + 40;
        
        // Draw rows of books
        for(let sy = startShelfY; sy < H; sy += shelfH + 10) {
            // Shelf board
            ctx.fillStyle = '#3e2723';
            ctx.fillRect(cx - archW/2, sy + shelfH, archW, 8);
            
            // Books on this shelf
            let bx = cx - archW/2 + 10;
            while(bx < cx + archW/2 - 10) {
                const bWidth = 8 + Math.random() * 10;
                const bHeight = 25 + Math.random() * 10;
                const bColor = Phaser.Utils.Array.GetRandom(['#ef5350', '#42a5f5', '#66bb6a', '#ffca28', '#ab47bc', '#d7ccc8', '#5d4037']);
                
                ctx.fillStyle = bColor;
                ctx.fillRect(bx, sy + shelfH - bHeight, bWidth, bHeight);
                
                // Spine detail
                ctx.fillStyle = 'rgba(0,0,0,0.2)';
                ctx.fillRect(bx, sy + shelfH - bHeight, 2, bHeight);
                
                bx += bWidth + 1;
            }
        }
        
        // Inner Shadow (Vignette to show depth)
        const innerShadow = ctx.createRadialGradient(cx, archY, 50, cx, archY - 100, archW);
        innerShadow.addColorStop(0, 'rgba(0,0,0,0)');
        innerShadow.addColorStop(1, 'rgba(0,0,0,0.8)');
        ctx.fillStyle = innerShadow;
        ctx.fillRect(cx - archW/2, archTopY, archW, archH);

        ctx.restore(); // End Clip

        // --- Arch Frame ---
        ctx.strokeStyle = '#ffd700'; // Gold
        ctx.lineWidth = 15;
        ctx.stroke(); // Re-stroke the path defined above
        
        // Detail line inside frame (Turquoise)
        ctx.strokeStyle = '#00bcd4';
        ctx.lineWidth = 4;
        ctx.stroke();

        // --- 3. Columns (Scroll Texture) ---
        const colW = 60;
        const drawColumn = (x: number) => {
            // Shaft (Papyrus color)
            const cGrd = ctx.createLinearGradient(x, 0, x+colW, 0);
            cGrd.addColorStop(0, '#ffe0b2'); 
            cGrd.addColorStop(0.5, '#fff3e0'); 
            cGrd.addColorStop(1, '#ffcc80');
            ctx.fillStyle = cGrd;
            ctx.fillRect(x, 200, colW, H - 200);
            
            // Fake Text (Squiggles)
            ctx.fillStyle = 'rgba(93, 64, 55, 0.3)';
            for(let y=220; y<H-50; y+=10) {
                const w = Math.random() * (colW - 20) + 10;
                const ox = (colW - w) / 2;
                ctx.fillRect(x + ox, y, w, 2);
            }
            
            // Base
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(x - 10, H - 30, colW + 20, 30);
            
            // Capital (Top) - Gold
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.moveTo(x - 10, 200);
            ctx.lineTo(x + colW + 10, 200);
            ctx.lineTo(x + colW, 240);
            ctx.lineTo(x, 240);
            ctx.fill();
        };
        
        drawColumn(50);
        drawColumn(W - 50 - colW);

        // --- 4. Calligraphy Band (Frieze) ---
        const bandY = 150;
        ctx.fillStyle = '#0d47a1'; // Royal Blue Band
        ctx.fillRect(40, bandY, W - 80, 50);
        
        // Gold Border
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 4;
        ctx.strokeRect(40, bandY, W - 80, 50);
        
        // --- 5. THE OPEN BOOK SYMBOL (Top Center) ---
        const bookY = 120;
        
        ctx.save();
        ctx.translate(cx, bookY);
        
        // Gold Outline
        ctx.fillStyle = '#ffd700';
        ctx.strokeStyle = '#f57f17';
        ctx.lineWidth = 2;
        
        // Left Page
        ctx.beginPath();
        ctx.moveTo(0, 20); // Spine bottom
        ctx.quadraticCurveTo(-30, 30, -60, 10); // Bottom curve
        ctx.lineTo(-60, -40); // Top left
        ctx.quadraticCurveTo(-30, -20, 0, -30); // Top curve to spine
        ctx.fill(); ctx.stroke();
        
        // Right Page
        ctx.beginPath();
        ctx.moveTo(0, 20);
        ctx.quadraticCurveTo(30, 30, 60, 10);
        ctx.lineTo(60, -40);
        ctx.quadraticCurveTo(30, -20, 0, -30);
        ctx.fill(); ctx.stroke();
        
        // Page Lines (Text hint)
        ctx.strokeStyle = '#fdd835';
        ctx.lineWidth = 2;
        for(let i=0; i<4; i++) {
            // Left
            ctx.beginPath(); ctx.moveTo(-10, -20 + i*10); ctx.lineTo(-50, -20 + i*10); ctx.stroke();
            // Right
            ctx.beginPath(); ctx.moveTo(10, -20 + i*10); ctx.lineTo(50, -20 + i*10); ctx.stroke();
        }
        
        ctx.restore();

        // --- 6. The Dome (Grand Top) ---
        const domeR = 120;
        const domeCy = 100; // Moved up slightly
        
        // Dome Shape
        ctx.beginPath();
        ctx.arc(cx, domeCy, domeR, Math.PI, 0); // Half circle
        
        // Gradient (Turquoise/Blue Tiles)
        const domeGrd = ctx.createRadialGradient(cx - 50, domeCy - 80, 20, cx, domeCy, domeR);
        domeGrd.addColorStop(0, '#4dd0e1'); // Highlight
        domeGrd.addColorStop(0.5, '#0097a7');
        domeGrd.addColorStop(1, '#006064'); // Shadow
        ctx.fillStyle = domeGrd;
        ctx.fill();
        
        // Spire
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(cx - 5, domeCy - domeR);
        ctx.lineTo(cx + 5, domeCy - domeR);
        ctx.lineTo(cx, domeCy - domeR - 50);
        ctx.fill();

        canvas.refresh();
    }

    // --- MARKET STALL GENERATOR ---

    private static generateMarketBuilding(scene: Phaser.Scene, key: string, cPrimary: string, cSecondary: string, goodsType: 'fruit' | 'pottery' | 'spices') {
        if (scene.textures.exists(key)) return;
        
        const W = 320, H = 460; 
        const canvas = scene.textures.createCanvas(key, W, H);
        if (!canvas) return;
        const ctx = canvas.context;
  
        // 1. Architecture (Mudbrick Walls)
        const wallColor = '#d7ccc8'; // Sandstone
        this.drawMudbrickTexture(ctx, W, H, wallColor);
        
        // Roof Line (Uneven)
        ctx.fillStyle = '#a1887f';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(W, 0);
        ctx.lineTo(W, 20);
        // Crenellations
        for (let x = W; x > 0; x -= 20) {
            ctx.lineTo(x, 20);
            ctx.lineTo(x, 10);
            ctx.lineTo(x - 10, 10);
            ctx.lineTo(x - 10, 20);
        }
        ctx.lineTo(0, 20);
        ctx.fill();

        // Vigas (Beam ends)
        this.drawVigas(ctx, 0, 40, W);

        // 2. Upper Window (Mashrabiya)
        const winX = W/2 - 30;
        const winY = 80;
        const winW = 60;
        const winH = 80;
        
        // Frame
        ctx.fillStyle = '#4e342e'; // Dark Wood
        ctx.fillRect(winX - 5, winY - 5, winW + 10, winH + 10);
        
        // Lattice Background
        ctx.fillStyle = '#261a15'; // Dark void
        ctx.fillRect(winX, winY, winW, winH);
        
        // Lattice Pattern
        ctx.strokeStyle = '#8d6e63';
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Diagonal grid
        for (let i = -winW; i < winH; i += 10) {
            ctx.moveTo(winX, winY + i);
            ctx.lineTo(winX + winW, winY + i + winW);
            ctx.moveTo(winX + winW, winY + i);
            ctx.lineTo(winX, winY + i + winW);
        }
        ctx.stroke();
        // Arch top for window
        ctx.fillStyle = wallColor;
        ctx.beginPath();
        ctx.moveTo(winX - 5, winY);
        ctx.quadraticCurveTo(winX + winW/2, winY - 20, winX + winW + 5, winY);
        ctx.lineTo(winX + winW + 5, winY + 20);
        ctx.lineTo(winX - 5, winY + 20);
        ctx.fill();

        // 3. Main Stall Arch (Horseshoe)
        const archX = W/2;
        const archY = H - 160;
        const archW = 200;
        const archH = 220;
        
        ctx.fillStyle = '#2d2640'; // Deep interior shadow
        ctx.beginPath();
        ctx.moveTo(archX - archW/2, H);
        ctx.lineTo(archX - archW/2, archY);
        // Horseshoe curve
        ctx.bezierCurveTo(archX - archW/2 - 20, archY - 100, archX + archW/2 + 20, archY - 100, archX + archW/2, archY);
        ctx.lineTo(archX + archW/2, H);
        ctx.fill();

        // Zellige Tile Trim
        const trimThickness = 15;
        ctx.lineWidth = trimThickness;
        ctx.strokeStyle = cPrimary; // Tile color
        ctx.stroke();
        
        // Gold Inner Lining
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#ffd700';
        ctx.stroke();

        // 4. Voluminous Awning
        const awnY = archY - 40;
        const awnW = W + 20;
        const awnH = 80;
        
        ctx.save();
        ctx.translate(-10, awnY);
        
        // Define Scalloped Path for Clipping
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(awnW, 0);
        
        // Scalloped Bottom
        const scallops = 8;
        const scalW = awnW / scallops;
        for (let i = 0; i < scallops; i++) {
            // Bezier for puffy volume (Right to Left)
            // ex is start of curve (right), sx is end of curve (left)
            const sx = awnW - ((i + 1) * scalW);
            const ex = awnW - (i * scalW);
            ctx.bezierCurveTo(
                ex - scalW*0.2, 60, // cp1
                sx + scalW*0.2, 60, // cp2
                sx, 0 // end
            );
        }
        ctx.closePath();
        
        // Apply Clip - this prevents stripes from drawing over the background wall
        ctx.clip();
        
        // Fill base stripe color (Secondary)
        ctx.fillStyle = cSecondary;
        ctx.fillRect(0, 0, awnW, awnH);

        // Stripes (Primary)
        ctx.fillStyle = cPrimary;
        const stripeWidth = 20;
        for (let x = 0; x < awnW; x += stripeWidth * 2) {
            ctx.fillRect(x, 0, stripeWidth, awnH);
        }
        
        // Volume Shading (Gradient)
        const vGrad = ctx.createLinearGradient(0, 0, 0, awnH);
        vGrad.addColorStop(0, 'rgba(255,255,255,0.2)'); // Highlight top
        vGrad.addColorStop(0.5, 'rgba(0,0,0,0)');
        vGrad.addColorStop(1, 'rgba(0,0,0,0.3)'); // Shadow bottom
        ctx.fillStyle = vGrad;
        ctx.fillRect(0,0,awnW,awnH);

        ctx.restore();

        // 5. Merchandise & Decor
        const groundY = H - 10;
        
        if (goodsType === 'fruit') {
            // Stacked Crates
            const drawCrate = (cx: number, cy: number, fruitColor: string) => {
                ctx.fillStyle = '#8d6e63';
                ctx.fillRect(cx, cy, 40, 30);
                // Fruit mound
                ctx.fillStyle = fruitColor;
                ctx.beginPath(); ctx.arc(cx+20, cy+5, 18, Math.PI, 0); ctx.fill();
                // Individual fruits
                for(let i=0; i<5; i++) {
                    ctx.beginPath(); ctx.arc(cx+10 + Math.random()*20, cy+5 + Math.random()*10, 6, 0, Math.PI*2); ctx.fill();
                }
                // Slats
                ctx.fillStyle = 'rgba(0,0,0,0.2)';
                ctx.fillRect(cx, cy+5, 40, 2);
                ctx.fillRect(cx, cy+15, 40, 2);
            };
            drawCrate(60, groundY - 30, '#ff9800'); // Oranges
            drawCrate(110, groundY - 30, '#d32f2f'); // Apples
            drawCrate(220, groundY - 30, '#fdd835'); // Lemons
            drawCrate(85, groundY - 55, '#8e24aa'); // Grapes on top
        } 
        else if (goodsType === 'pottery') {
            const drawPot = (px: number, py: number, w: number, h: number, color: string) => {
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.ellipse(px, py - h/2, w/2, h/2, 0, 0, Math.PI*2);
                ctx.fill();
                // Neck
                ctx.fillRect(px - w/3, py - h, w/1.5, h/4);
                // Rim
                ctx.beginPath(); ctx.ellipse(px, py - h, w/2.5, 4, 0, 0, Math.PI*2); ctx.fill();
            };
            drawPot(60, groundY, 20, 30, '#795548');
            drawPot(100, groundY, 25, 40, '#5d4037');
            drawPot(140, groundY, 15, 20, '#8d6e63');
            drawPot(250, groundY, 30, 50, '#3e2723'); // Big urn
        }
        else { // Spices
            const drawSack = (sx: number, sy: number, color: string) => {
                ctx.fillStyle = '#d7ccc8'; // Sack color
                ctx.beginPath();
                ctx.moveTo(sx, sy);
                ctx.quadraticCurveTo(sx - 20, sy - 10, sx - 15, sy - 40); // Left side
                ctx.lineTo(sx + 15, sy - 40); // Top
                ctx.quadraticCurveTo(sx + 20, sy - 10, sx, sy); // Right side
                ctx.fill();
                // Spice mound
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.moveTo(sx - 15, sy - 40);
                ctx.quadraticCurveTo(sx, sy - 60, sx + 15, sy - 40);
                ctx.fill();
            };
            drawSack(60, groundY, '#ffb300'); // Turmeric
            drawSack(100, groundY, '#d32f2f'); // Paprika
            drawSack(140, groundY, '#795548'); // Cumin
            drawSack(240, groundY, '#e64a19'); // Chili
        }

        // Hanging Lantern
        const lanternX = W - 60;
        const lanternY = archY + 20;
        // Chain
        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(lanternX, archY - 20); ctx.lineTo(lanternX, lanternY); ctx.stroke();
        // Lantern Body
        ctx.fillStyle = '#ffd700'; // Brass
        ctx.beginPath();
        ctx.moveTo(lanternX, lanternY);
        ctx.lineTo(lanternX + 10, lanternY + 15);
        ctx.lineTo(lanternX, lanternY + 40);
        ctx.lineTo(lanternX - 10, lanternY + 15);
        ctx.fill();
        // Glow
        ctx.fillStyle = 'rgba(255, 235, 59, 0.4)';
        ctx.beginPath(); ctx.arc(lanternX, lanternY + 20, 20, 0, Math.PI*2); ctx.fill();

        canvas.refresh();
    }
  
    // --- POTTERY SHOP GENERATOR ---

    private static generatePotteryBuilding(scene: Phaser.Scene) {
        if (scene.textures.exists('building_pottery')) return;
        const W = 320, H = 460;
        const canvas = scene.textures.createCanvas('building_pottery', W, H);
        if (!canvas) return;
        const ctx = canvas.context;
  
        // 1. Walls
        this.drawMudbrickTexture(ctx, W, H, '#dcedc8'); // Light greenish clay tone
        
        // 2. Kiln (Domed structure on roof)
        const kilnX = W - 80;
        const kilnY = 60;
        const kilnW = 60;
        
        ctx.fillStyle = '#5d4037'; // Dark clay brick
        ctx.beginPath();
        ctx.arc(kilnX, kilnY, kilnW/2, Math.PI, 0); // Dome
        ctx.lineTo(kilnX + kilnW/2, kilnY + 40);
        ctx.lineTo(kilnX - kilnW/2, kilnY + 40);
        ctx.fill();
        
        // Chimney
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(kilnX - 10, kilnY - 50, 20, 30);
        // Smoke puffs (static)
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath(); ctx.arc(kilnX + 5, kilnY - 60, 8, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(kilnX - 5, kilnY - 70, 12, 0, Math.PI*2); ctx.fill();

        // 3. Wooden Shelving Unit
        const shelfX = 40;
        const shelfY = 150;
        const shelfW = W - 80;
        const shelfH = 200;
        
        ctx.fillStyle = '#4e342e'; // Wood frame
        ctx.fillRect(shelfX, shelfY, 10, shelfH); // Left post
        ctx.fillRect(shelfX + shelfW - 10, shelfY, 10, shelfH); // Right post
        
        // Shelves
        const levels = 3;
        for(let i=0; i<=levels; i++) {
            const y = shelfY + (i * (shelfH/levels));
            ctx.fillRect(shelfX, y, shelfW, 8);
            
            // Populate shelf with pots
            if (i < levels) {
                const pots = 4 + Math.floor(Math.random() * 3);
                const space = (shelfW - 20) / pots;
                for (let p=0; p<pots; p++) {
                    const px = shelfX + 15 + (p * space) + Math.random()*5;
                    const py = y + (shelfH/levels) - 5;
                    
                    const pColor = Phaser.Utils.Array.GetRandom(['#795548', '#8d6e63', '#a1887f', '#3e2723', '#d84315']);
                    const pW = 15 + Math.random()*10;
                    const pH = 20 + Math.random()*15;
                    
                    ctx.fillStyle = pColor;
                    ctx.beginPath();
                    ctx.ellipse(px, py - pH/2, pW/2, pH/2, 0, 0, Math.PI*2);
                    ctx.fill();
                    
                    // Detail stripe
                    ctx.fillStyle = 'rgba(255,255,255,0.3)';
                    ctx.fillRect(px - pW/2, py - pH/2, pW, 2);
                }
            }
        }

        // 4. Signage
        const signX = 60;
        const signY = 100;
        
        // Horizontal bar
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(signX, signY, 80, 5);
        // Hanging Cloth Banner
        ctx.fillStyle = '#e0f2f1'; // Canvas
        ctx.beginPath();
        ctx.moveTo(signX + 10, signY + 5);
        ctx.lineTo(signX + 70, signY + 5);
        ctx.lineTo(signX + 70, signY + 50);
        ctx.lineTo(signX + 40, signY + 60); // Point
        ctx.lineTo(signX + 10, signY + 50);
        ctx.fill();
        // Pot Icon on Sign
        ctx.fillStyle = '#d84315';
        ctx.beginPath(); ctx.arc(signX + 40, signY + 30, 10, 0, Math.PI*2); ctx.fill();

        canvas.refresh();
    }
  
    // --- RUG SHOP GENERATOR ---

    private static generateRugBuilding(scene: Phaser.Scene) {
        if (scene.textures.exists('building_rugs')) return;
        const W = 320, H = 460;
        const canvas = scene.textures.createCanvas('building_rugs', W, H);
        if (!canvas) return;
        const ctx = canvas.context;

        // 1. Walls
        this.drawMudbrickTexture(ctx, W, H, '#ffe0b2'); // Warm peach/sand
        
        // 2. Balcony (Wooden Structure)
        const balY = 180;
        const balH = 60;
        
        // Supports
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(20, balY + balH, 10, 20); // Bracket
        ctx.beginPath(); ctx.moveTo(30, balY+balH+20); ctx.lineTo(30, balY+balH); ctx.lineTo(50, balY+balH); ctx.fill();
        
        ctx.fillRect(W-30, balY + balH, 10, 20); // Bracket
        ctx.beginPath(); ctx.moveTo(W-30, balY+balH+20); ctx.lineTo(W-30, balY+balH); ctx.lineTo(W-50, balY+balH); ctx.fill();

        // Floor
        ctx.fillRect(10, balY + balH, W-20, 10);
        
        // Railing
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(10, balY, W-20, 5); // Top rail
        // Balusters
        for(let x=20; x<W-20; x+=15) {
            ctx.fillRect(x, balY, 4, balH);
        }

        // 3. Draped Rugs (Over Balcony)
        const drawDrapedRug = (x: number, width: number, length: number, colors: string[]) => {
            const [main, detail] = colors;
            ctx.fillStyle = main;
            ctx.fillRect(x, balY, width, length);
            
            // Fringes at bottom
            ctx.fillStyle = '#fff';
            for(let fx=x; fx<x+width; fx+=4) {
                ctx.fillRect(fx, balY+length, 2, 5);
            }
            
            // Zigzag Pattern
            ctx.strokeStyle = detail;
            ctx.lineWidth = 2;
            ctx.beginPath();
            for(let y=balY+10; y<balY+length-10; y+=10) {
                ctx.moveTo(x, y);
                for(let k=0; k<width; k+=10) {
                    ctx.lineTo(x + k + 5, y + 5);
                    ctx.lineTo(x + k + 10, y);
                }
            }
            ctx.stroke();
        };

        drawDrapedRug(40, 40, 80, ['#c62828', '#ffcdd2']); // Red
        drawDrapedRug(100, 50, 100, ['#1565c0', '#90caf9']); // Blue
        drawDrapedRug(180, 45, 70, ['#2e7d32', '#a5d6a7']); // Green
        drawDrapedRug(240, 40, 90, ['#fbc02d', '#fff9c4']); // Yellow

        // 4. Shop Entrance (Open)
        const doorW = 120;
        const doorH = 140;
        const doorX = W/2 - doorW/2;
        const doorY = H - doorH;
        
        ctx.fillStyle = '#212121'; // Dark interior
        ctx.fillRect(doorX, doorY, doorW, doorH);
        
        // Frame
        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = 8;
        ctx.strokeRect(doorX, doorY, doorW, doorH);

        // 5. Rug Stacks (Piles outside)
        const drawStack = (sx: number, sy: number) => {
            for(let i=0; i<5; i++) {
                ctx.fillStyle = Phaser.Utils.Array.GetRandom(['#d32f2f', '#1976d2', '#388e3c', '#fbc02d', '#7b1fa2']);
                // Folded rug shape (rounded rect)
                const w = 50 + Math.random()*10;
                ctx.beginPath();
                ctx.roundRect(sx - w/2, sy - (i*12), w, 10, 4);
                ctx.fill();
                // Pattern line
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.fillRect(sx - w/2, sy - (i*12) + 4, w, 2);
            }
        };
        
        drawStack(60, H-20);
        drawStack(W-60, H-20);

        canvas.refresh();
    }
}
