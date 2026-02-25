
import Phaser from 'phaser';

export class DesertAssetGenerator {
    static init(scene: Phaser.Scene) {
        this.generateLayeredDunes(scene);
        this.generateDesertRocks(scene);
    }

    private static generateLayeredDunes(scene: Phaser.Scene) {
        // We will generate 3 distinct layers for parallax
        // Layer 3: Furthest (Back) - Where Camels walk
        // Layer 2: Mid
        // Layer 1: Close (Front)
        
        const W = 1024, H = 512;

        const createLayer = (key: string, ridgeY: number, amp: number, colorTop: string, colorBot: string, seed: number) => {
            if (scene.textures.exists(key)) return;
            
            const canvas = scene.textures.createCanvas(key, W, H);
            if (!canvas) return;
            const ctx = canvas.context;
            
            ctx.clearRect(0, 0, W, H);

            const grd = ctx.createLinearGradient(0, ridgeY - amp, 0, H);
            grd.addColorStop(0, colorTop);
            grd.addColorStop(1, colorBot);
            ctx.fillStyle = grd;

            ctx.beginPath();
            ctx.moveTo(0, H);
            
            // Start of curve
            let curX = 0;
            // Ensure tiling continuity: start Y must roughly match end Y logic, 
            // but sine waves naturally tile if period matches width.
            // Here we use a bezier loop.
            let curY = ridgeY + Math.sin(seed) * amp;
            ctx.lineTo(0, curY);

            const segments = 4; // More segments = more bumps
            const segW = W / segments;
            
            for(let i=0; i<segments; i++) {
                const nextX = (i + 1) * segW;
                // Determine next Y. For the last point, force it to match start Y for seamless tiling
                const nextY = (i === segments - 1) 
                    ? ridgeY + Math.sin(seed) * amp 
                    : ridgeY + Math.sin(seed + i + 1) * amp;

                // Control points
                const cp1x = curX + segW * 0.5;
                const cp1y = curY; 
                const cp2x = nextX - segW * 0.5;
                const cp2y = nextY;

                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, nextX, nextY);
                
                curX = nextX;
                curY = nextY;
            }

            ctx.lineTo(W, H);
            ctx.lineTo(0, H);
            ctx.fill();

            // Rim Light (Moonlight edge)
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.stroke();
            
            canvas.refresh();
        };

        // 1. Far Layer (Darkest, Highest Ridge) - Camels walk here
        // Ridge at ~220px from top (leaving space for camels)
        createLayer('bg_dune_3', 280, 20, '#1c1816', '#2d201a', 1);

        // 2. Mid Layer (Mid brightness)
        // Ridge at ~350px from top
        createLayer('bg_dune_2', 360, 30, '#3e2723', '#4e342e', 2);

        // 3. Front Layer (Lightest, Lowest)
        // Ridge at ~420px from top
        createLayer('bg_dune_1', 440, 40, '#5d4037', '#6d4c41', 3);
    }

    private static generateDesertRocks(scene: Phaser.Scene) {
        if (scene.textures.exists('bg_desert_mid')) return;
        const W = 1024, H = 512;
        const canvas = scene.textures.createCanvas('bg_desert_mid', W, H);
        if(!canvas) return;
        const ctx = canvas.context;

        ctx.fillStyle = '#2d2420'; 

        let cx = 0;
        while(cx < W) {
            cx += Phaser.Math.Between(300, 800); // Sparse
            if (cx > W) break;

            const w = Phaser.Math.Between(60, 150);
            const h = Phaser.Math.Between(40, 80);
            const y = H;

            // Smoother Rock Shape
            ctx.beginPath();
            ctx.moveTo(cx, y);
            ctx.quadraticCurveTo(cx + w/2, y - h*1.5, cx + w, y);
            ctx.fill();
            
            // Highlight
            ctx.fillStyle = 'rgba(255,255,255,0.03)';
            ctx.beginPath();
            ctx.moveTo(cx, y);
            ctx.quadraticCurveTo(cx + w/3, y - h, cx + w/2, y);
            ctx.fill();
            
            ctx.fillStyle = '#2d2420';
        }

        canvas.refresh();
    }
}
