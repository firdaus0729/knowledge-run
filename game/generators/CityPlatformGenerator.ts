
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
        if (scene.textures.exists('floating_plat_city_bridge')) {
            scene.textures.remove('floating_plat_city_bridge');
        }

        this.generateCityGround(scene);
        this.generateCityFloatingPlatform(scene);
        this.generateCityBridge(scene);
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

    /** Andalusian-style floating platform: stone slab with arch, decorative band, walkable surface. */
    private static generateCityFloatingPlatform(scene: Phaser.Scene) {
        const W = 160;
        const H = 54;
        const canvas = scene.textures.createCanvas('floating_plat_city', W, H);
        if (!canvas) return;
        const ctx = canvas.context;

        const slabH = 28;
        const slabY = 8;
        const walkH = 12;

        // --- 1. Stone base (warm sand/limestone) ---
        const stoneGrd = ctx.createLinearGradient(0, slabY + slabH, 0, slabY);
        stoneGrd.addColorStop(0, '#8d6e63');
        stoneGrd.addColorStop(0.5, '#bcaaa4');
        stoneGrd.addColorStop(1, '#d7ccc8');
        ctx.fillStyle = stoneGrd;
        ctx.beginPath();
        ctx.roundRect(4, slabY, W - 8, slabH, 6);
        ctx.fill();

        // --- 2. Horseshoe arch silhouette under the slab (Andalusian) ---
        ctx.fillStyle = 'rgba(94, 53, 59, 0.85)';
        ctx.beginPath();
        const archTop = slabY + slabH - 4;
        const archW = W * 0.7;
        const archCx = W / 2;
        ctx.moveTo(archCx - archW / 2, archTop);
        ctx.quadraticCurveTo(archCx - archW / 2, slabY - 6, archCx, slabY + 6);
        ctx.quadraticCurveTo(archCx + archW / 2, slabY - 6, archCx + archW / 2, archTop);
        ctx.lineTo(archCx + archW / 2, H);
        ctx.lineTo(archCx - archW / 2, H);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = 2;
        ctx.stroke();

        // --- 3. Decorative band (gold / terracotta) on walkable edge ---
        const bandGrd = ctx.createLinearGradient(0, 0, 0, walkH);
        bandGrd.addColorStop(0, '#ffecb3');
        bandGrd.addColorStop(0.5, '#ffc107');
        bandGrd.addColorStop(1, '#ff8f00');
        ctx.fillStyle = bandGrd;
        ctx.fillRect(0, 0, W, walkH);
        ctx.fillStyle = '#4a148c';
        for (let i = 0; i < W; i += 24) {
            ctx.beginPath();
            ctx.arc(i + 12, walkH / 2, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.strokeStyle = '#ffc107';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(1, 1, W - 2, walkH - 2);

        // --- 4. Shadow under slab ---
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(8, slabY + slabH, W - 16, 6);

        canvas.refresh();
    }

    /** Bridge segment: arched stone span for dual-path and bridge patterns. */
    private static generateCityBridge(scene: Phaser.Scene) {
        const W = 160;
        const H = 54;
        const canvas = scene.textures.createCanvas('floating_plat_city_bridge', W, H);
        if (!canvas) return;
        const ctx = canvas.context;

        const deckH = 14;
        const archTop = 22;

        // Stone deck (walkable)
        const deckGrd = ctx.createLinearGradient(0, deckH, 0, 0);
        deckGrd.addColorStop(0, '#a1887f');
        deckGrd.addColorStop(1, '#d7ccc8');
        ctx.fillStyle = deckGrd;
        ctx.beginPath();
        ctx.roundRect(0, 0, W, deckH, 4);
        ctx.fill();

        // Gold trim strip
        ctx.fillStyle = '#ffc107';
        ctx.fillRect(0, deckH - 3, W, 3);
        ctx.fillStyle = '#4a148c';
        for (let i = 0; i < W; i += 20) {
            ctx.fillRect(i + 8, deckH - 2, 4, 2);
        }

        // Two small arches beneath (Moorish style)
        ctx.fillStyle = 'rgba(94, 53, 59, 0.9)';
        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = 2;
        const drawArch = (cx: number) => {
            const w = 36;
            ctx.beginPath();
            ctx.moveTo(cx - w / 2, archTop);
            ctx.quadraticCurveTo(cx - w / 2, deckH - 2, cx, deckH + 4);
            ctx.quadraticCurveTo(cx + w / 2, deckH - 2, cx + w / 2, archTop);
            ctx.lineTo(cx + w / 2, H);
            ctx.lineTo(cx - w / 2, H);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        };
        drawArch(W * 0.3);
        drawArch(W * 0.7);

        // Geometric inlay (8-point star hint)
        ctx.fillStyle = 'rgba(255, 193, 7, 0.4)';
        ctx.beginPath();
        const cx = W / 2;
        const cy = deckH / 2;
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
            const r = i % 2 === 0 ? 6 : 3;
            const x = cx + Math.cos(a) * r;
            const y = cy + Math.sin(a) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();

        canvas.refresh();
    }
}
