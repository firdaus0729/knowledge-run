
import Phaser from 'phaser';

export class CityPlatformGenerator {
    static init(scene: Phaser.Scene) {
        // We remove the old texture if it exists to force regeneration during hot-reload development
        if (scene.textures.exists('ground_city')) {
            scene.textures.remove('ground_city');
        }
        if (scene.textures.exists('floating_plat_city')) {
            scene.textures.remove('floating_plat_city');
        }

        this.generateCityGround(scene);
        this.generateCityFloatingPlatform(scene);
    }

    private static generateCityGround(scene: Phaser.Scene) {
        const W = 1024;
        const H = 128;
        const canvas = scene.textures.createCanvas('ground_city', W, H);
        if (!canvas) return;
        const ctx = canvas.context;

        // --- 1. Base Layer (Grout) ---
        ctx.fillStyle = '#12005e'; // Deep Indigo
        ctx.fillRect(0, 0, W, H);

        // --- 2. Detailed Vibrant Bricks ---
        const trimH = 32;
        const startY = trimH;
        
        const brickW = 90;
        const brickH = 40;
        const gap = 4;

        // Create a pattern of bricks
        for (let y = startY; y < H; y += brickH) {
            const row = Math.floor((y - startY) / brickH);
            const offset = (row % 2) * (brickW / 2);

            for (let x = -brickW; x < W; x += brickW) {
                const bx = x + offset + gap/2;
                const by = y + gap/2;
                const bw = brickW - gap;
                const bh = brickH - gap;

                // Gradient for 3D rounded look - Brighter Purple
                const grd = ctx.createLinearGradient(bx, by, bx, by + bh);
                // Randomize slightly for variety
                if (Math.random() > 0.3) {
                    grd.addColorStop(0, '#7e57c2'); // Medium Purple (Vibrant)
                    grd.addColorStop(1, '#4527a0'); // Deep Purple
                } else {
                    grd.addColorStop(0, '#673ab7'); // Deep Purple
                    grd.addColorStop(1, '#311b92'); // Indigo
                }
                
                ctx.fillStyle = grd;
                
                // Draw rounded rect brick
                ctx.beginPath();
                ctx.roundRect(bx, by, bw, bh, 6);
                ctx.fill();

                // Inner Highlight (Bevel Top)
                ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'; 
                ctx.beginPath();
                ctx.roundRect(bx + 2, by + 2, bw - 4, bh/2, 4);
                ctx.fill();

                // Inset detail (Diamond stamp) on some bricks
                if ((x / brickW + row) % 3 === 0) {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                    ctx.beginPath();
                    ctx.moveTo(bx + bw/2, by + 8);
                    ctx.lineTo(bx + bw/2 + 8, by + bh/2);
                    ctx.lineTo(bx + bw/2, by + bh - 8);
                    ctx.lineTo(bx + bw/2 - 8, by + bh/2);
                    ctx.fill();
                }
            }
        }

        // --- 3. Shadow Gradient Overlay (Depth from bottom) ---
        const depthGrd = ctx.createLinearGradient(0, startY, 0, H);
        depthGrd.addColorStop(0, 'rgba(0,0,0,0)');
        depthGrd.addColorStop(1, 'rgba(0,0,0,0.5)');
        ctx.fillStyle = depthGrd;
        ctx.fillRect(0, startY, W, H - startY);

        // --- 4. Ornate Gold Trim (The Walkable Surface) ---
        // Main Gold Bar - Brighter
        const goldGrd = ctx.createLinearGradient(0, 0, 0, trimH);
        goldGrd.addColorStop(0, '#ffecb3'); // Pale Yellow
        goldGrd.addColorStop(0.4, '#ffc107'); // Bright Amber
        goldGrd.addColorStop(1, '#ff6f00'); // Orange Shadow
        ctx.fillStyle = goldGrd;
        ctx.fillRect(0, 0, W, trimH);

        // Islamic Geometric Pattern on Trim
        ctx.fillStyle = '#4a148c'; // Deep Purple inlay
        const patternSize = 32;
        for (let i = 0; i < W; i += patternSize) {
            // Star/Flower shape inlay
            const cx = i + patternSize/2;
            const cy = trimH/2;
            ctx.beginPath();
            ctx.arc(cx, cy, 5, 0, Math.PI*2);
            ctx.fill();
            // Connecting lines
            ctx.fillRect(i + patternSize - 2, 8, 4, trimH - 16);
        }

        // Cyan Neon Strip (Magical energy)
        ctx.fillStyle = '#00e5ff'; // Bright Cyan
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 8;
        ctx.fillRect(0, trimH - 3, W, 2);
        ctx.shadowBlur = 0;

        // Top Edge Highlight (Sharp)
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillRect(0, 0, W, 1);

        // Drop shadow under trim onto bricks
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, trimH, W, 6);

        canvas.refresh();
    }

    private static generateCityFloatingPlatform(scene: Phaser.Scene) {
        const W = 160;
        const H = 54;
        const canvas = scene.textures.createCanvas('floating_plat_city', W, H);
        if (!canvas) return;
        const ctx = canvas.context;

        // --- 1. Floating Stone Block (Matches ground style) ---
        const slabH = 24;
        const slabY = 10;

        // Main Block
        const grd = ctx.createLinearGradient(0, slabY, 0, slabY + slabH);
        grd.addColorStop(0, '#7e57c2');
        grd.addColorStop(1, '#4527a0');
        ctx.fillStyle = grd;
        
        ctx.beginPath();
        ctx.roundRect(0, slabY, W, slabH, 8);
        ctx.fill();

        // Bright Gold Border
        ctx.strokeStyle = '#ffc107';
        ctx.lineWidth = 3;
        ctx.strokeRect(2, slabY + 2, W-4, slabH - 4);

        // --- 2. Magic Carpet Draped Over Top ---
        const rugH = 14;
        const rugGrd = ctx.createLinearGradient(0, 0, 0, rugH);
        rugGrd.addColorStop(0, '#e91e63'); // Vibrant Pink/Red
        rugGrd.addColorStop(1, '#880e4f');
        ctx.fillStyle = rugGrd;
        
        // Rug Shape with hanging tassels
        ctx.fillRect(4, 0, W-8, rugH); // Top surface
        
        // Tassels
        ctx.fillStyle = '#ffca28';
        for(let x=6; x<W-6; x+=8) {
            ctx.fillRect(x, rugH, 3, 5);
        }

        // --- 3. Levitation Energy (Bottom) ---
        const energyGrd = ctx.createLinearGradient(0, slabY + slabH, 0, H);
        energyGrd.addColorStop(0, 'rgba(0, 229, 255, 0.8)'); // Bright Cyan
        energyGrd.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = energyGrd;
        
        // Rune Crystal shape at bottom
        ctx.beginPath();
        ctx.moveTo(W/2 - 15, slabY + slabH - 2);
        ctx.lineTo(W/2 + 15, slabY + slabH - 2);
        ctx.lineTo(W/2, H);
        ctx.fill();

        canvas.refresh();
    }
}
