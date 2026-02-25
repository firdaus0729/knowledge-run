
import Phaser from 'phaser';

export class LibraryAssetGenerator {
    static init(scene: Phaser.Scene) {
        this.generateFarBackground(scene);
        this.generateMidShelves(scene);
        this.generateNearColumns(scene);
        this.generateLibraryGround(scene);
        
        // Decor Items
        this.generateCandelabra(scene);
        this.generateGlobe(scene);
        this.generateScrollRack(scene);
        this.generateAstrolabe(scene);

        // Puzzle Assets
        this.generateAstrolabePuzzleAssets(scene);
    }

    private static generateAstrolabePuzzleAssets(scene: Phaser.Scene) {
        // ... (Keep existing puzzle assets logic) ...
        const ringSizes = [280, 220, 160];
        ['outer', 'mid', 'inner'].forEach((type, i) => {
            const key = `astrolabe_ring_${type}`;
            if (scene.textures.exists(key)) return;
            const size = ringSizes[i] + 20;
            const canvas = scene.textures.createCanvas(key, size, size);
            if (!canvas) return;
            const ctx = canvas.context;
            const cx = size/2;
            const r = ringSizes[i] / 2;
            ctx.strokeStyle = i === 0 ? '#ffd700' : (i === 1 ? '#cd7f32' : '#c0c0c0'); 
            ctx.lineWidth = 15;
            ctx.beginPath(); ctx.arc(cx, cx, r, 0, Math.PI * 2); ctx.stroke();
            ctx.strokeStyle = 'rgba(0,0,0,0.4)';
            ctx.lineWidth = 2;
            const segs = 12 + (i * 4);
            for(let j=0; j<segs; j++) {
                const ang = (j / segs) * Math.PI * 2;
                const x1 = cx + Math.cos(ang) * (r - 6);
                const y1 = cx + Math.sin(ang) * (r - 6);
                const x2 = cx + Math.cos(ang) * (r + 6);
                const y2 = cx + Math.sin(ang) * (r + 6);
                ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
            }
            canvas.refresh();
        });

        if (!scene.textures.exists('astrolabe_core')) {
            const canvas = scene.textures.createCanvas('astrolabe_core', 64, 64);
            if (canvas) {
                const ctx = canvas.context;
                const cx = 32;
                const grd = ctx.createRadialGradient(cx, cx, 5, cx, cx, 30);
                grd.addColorStop(0, '#00e5ff');
                grd.addColorStop(1, '#006064');
                ctx.fillStyle = grd;
                ctx.beginPath(); ctx.arc(cx, cx, 20, 0, Math.PI*2); ctx.fill();
                ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
                canvas.refresh();
            }
        }

        if (!scene.textures.exists('holo_bridge_segment')) {
            const canvas = scene.textures.createCanvas('holo_bridge_segment', 100, 40);
            if (canvas) {
                const ctx = canvas.context;
                ctx.fillStyle = 'rgba(0, 229, 255, 0.4)';
                ctx.fillRect(0, 0, 100, 40);
                ctx.strokeStyle = '#00e5ff';
                ctx.lineWidth = 2;
                ctx.strokeRect(0, 0, 100, 40);
                ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(100, 40); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(100, 0); ctx.lineTo(0, 40); ctx.stroke();
                canvas.refresh();
            }
        }

        if (!scene.textures.exists('constellation_leo')) {
            const canvas = scene.textures.createCanvas('constellation_leo', 200, 150);
            if (canvas) {
                const ctx = canvas.context;
                ctx.fillStyle = 'rgba(0,0,0,0)'; 
                ctx.fillRect(0,0,200,150);
                canvas.refresh();
            }
        }
    }

    // --- DECOR ASSETS ---
    // ... (Keep Candelabra, Globe, ScrollRack, Astrolabe logic exactly same) ...
    private static generateCandelabra(scene: Phaser.Scene) {
        if (scene.textures.exists('library_candelabra')) return;
        const W = 100, H = 250;
        const canvas = scene.textures.createCanvas('library_candelabra', W, H);
        if (!canvas) return;
        const ctx = canvas.context;
        const cx = W / 2;
        ctx.fillStyle = '#ffd700'; 
        ctx.beginPath(); ctx.moveTo(cx, H); ctx.lineTo(cx + 20, H); ctx.lineTo(cx + 10, H - 20); ctx.lineTo(cx - 10, H - 20); ctx.lineTo(cx - 20, H); ctx.fill();
        ctx.fillRect(cx - 3, 50, 6, H - 50);
        ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(cx, 120); ctx.bezierCurveTo(cx - 40, 120, cx - 40, 80, cx - 40, 70);
        ctx.moveTo(cx, 120); ctx.bezierCurveTo(cx + 40, 120, cx + 40, 80, cx + 40, 70);
        ctx.moveTo(cx, 90); ctx.bezierCurveTo(cx - 25, 90, cx - 25, 60, cx - 25, 50);
        ctx.moveTo(cx, 90); ctx.bezierCurveTo(cx + 25, 90, cx + 25, 60, cx + 25, 50); ctx.stroke();
        const drawCandle = (x: number, y: number) => {
            ctx.fillStyle = '#fff8e1'; ctx.fillRect(x - 3, y, 6, 15);
            ctx.fillStyle = '#ff6f00'; ctx.beginPath(); ctx.arc(x, y - 5, 4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffeb3b'; ctx.beginPath(); ctx.arc(x, y - 5, 2, 0, Math.PI * 2); ctx.fill();
        };
        drawCandle(cx, 35); drawCandle(cx - 40, 55); drawCandle(cx + 40, 55); drawCandle(cx - 25, 35); drawCandle(cx + 25, 35);
        canvas.refresh();
    }

    private static generateGlobe(scene: Phaser.Scene) {
        if (scene.textures.exists('library_globe')) return;
        const W = 160, H = 220;
        const canvas = scene.textures.createCanvas('library_globe', W, H);
        if (!canvas) return;
        const ctx = canvas.context;
        const cx = W / 2;
        ctx.fillStyle = '#5d4037'; ctx.beginPath(); ctx.moveTo(cx, H); ctx.lineTo(cx + 30, H); ctx.lineTo(cx + 5, H - 40); ctx.lineTo(cx + 5, H - 80); ctx.lineTo(cx - 5, H - 80); ctx.lineTo(cx - 5, H - 40); ctx.lineTo(cx - 30, H); ctx.fill();
        const globeY = H - 120; const radius = 60;
        ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx, globeY, radius + 8, 0, Math.PI * 2); ctx.stroke();
        const grd = ctx.createRadialGradient(cx - 20, globeY - 20, 10, cx, globeY, radius);
        grd.addColorStop(0, '#4fc3f7'); grd.addColorStop(1, '#01579b');
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(cx, globeY, radius, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#c5e1a5'; ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.arc(cx - 10, globeY - 10, 20, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(cx + 30, globeY + 20, 15, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1.0;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(cx, globeY, radius, radius * 0.4, 0, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx, globeY - radius); ctx.quadraticCurveTo(cx - 30, globeY, cx, globeY + radius); ctx.stroke();
        canvas.refresh();
    }

    private static generateScrollRack(scene: Phaser.Scene) {
        if (scene.textures.exists('library_scroll_rack')) return;
        const W = 140, H = 180;
        const canvas = scene.textures.createCanvas('library_scroll_rack', W, H);
        if (!canvas) return;
        const ctx = canvas.context;
        ctx.fillStyle = '#3e2723'; ctx.fillRect(10, 10, 10, H - 10); ctx.fillRect(W - 20, 10, 10, H - 10); ctx.fillRect(10, H - 15, W - 20, 15); ctx.fillRect(10, 10, W - 20, 10);
        const shelves = 4; const shelfH = (H - 40) / shelves;
        for (let i = 0; i < shelves; i++) {
            const y = 30 + i * shelfH;
            ctx.fillStyle = '#5d4037'; ctx.fillRect(20, y + 25, W - 40, 5);
            const scrolls = 5; const scrollW = (W - 40) / scrolls;
            for (let j = 0; j < scrolls; j++) {
                if (Math.random() > 0.2) { 
                    const sx = 22 + j * scrollW; const sy = y + 5;
                    ctx.fillStyle = '#fff9c4'; ctx.fillRect(sx + 2, sy, scrollW - 4, 20);
                    ctx.fillStyle = '#fbc02d'; ctx.beginPath(); ctx.arc(sx + scrollW/2, sy + 10, 4, 0, Math.PI*2); ctx.fill();
                }
            }
        }
        canvas.refresh();
    }

    private static generateAstrolabe(scene: Phaser.Scene) {
        if (scene.textures.exists('fg_astrolabe')) return;
        const S = 300; 
        const canvas = scene.textures.createCanvas('fg_astrolabe', S, S);
        if (!canvas) return;
        const ctx = canvas.context;
        const cx = S/2;
        ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 15; ctx.beginPath(); ctx.arc(cx, cx, 120, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = 'rgba(20, 20, 40, 0.5)'; ctx.fill();
        ctx.strokeStyle = '#ffb74d'; ctx.lineWidth = 4; ctx.beginPath();
        for(let i=0; i<8; i++) {
            const angle = (i / 8) * Math.PI * 2; const r = 100;
            ctx.moveTo(cx, cx); ctx.lineTo(cx + Math.cos(angle) * r, cx + Math.sin(angle) * r);
            ctx.moveTo(cx + Math.cos(angle) * r, cx + Math.sin(angle) * r); ctx.lineTo(cx + Math.cos(angle + 0.2) * (r-20), cx + Math.sin(angle + 0.2) * (r-20));
        }
        ctx.stroke();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(cx - 130, cx); ctx.lineTo(cx + 130, cx); ctx.stroke();
        ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(cx, 20, 15, 0, Math.PI*2); ctx.stroke();
        canvas.refresh();
    }

    // LAYER 3: FAR BACKGROUND (Vast depth)
    private static generateFarBackground(scene: Phaser.Scene) {
        if (scene.textures.exists('bg_lib_far')) return;
        const W = 1024, H = 1024; // Extended Height
        const HORIZON = 512; 

        const canvas = scene.textures.createCanvas('bg_lib_far', W, H);
        if (!canvas) return;
        const ctx = canvas.context;

        // 1. Deep Void Background (Full height)
        const bgGrd = ctx.createLinearGradient(0, 0, 0, H);
        bgGrd.addColorStop(0, '#0d001a'); // Almost black purple
        bgGrd.addColorStop(1, '#1a0033'); // Deep violet
        ctx.fillStyle = bgGrd;
        ctx.fillRect(0, 0, W, H);

        // 2. Distant Silhouettes (Giant Arches)
        ctx.fillStyle = '#240046'; // Lighter silhouette
        const archW = 150;
        const spacing = 200;
        
        for (let x = 0; x < W; x += spacing) {
            ctx.beginPath();
            ctx.moveTo(x, H); // Extend to bottom
            ctx.lineTo(x, HORIZON - 300);
            ctx.quadraticCurveTo(x + archW/2, HORIZON - 450, x + archW, HORIZON - 300); 
            ctx.lineTo(x + archW, H); // Extend to bottom
            ctx.fill();
            
            // Faint window slit
            ctx.fillStyle = '#3c096c';
            ctx.fillRect(x + archW/2 - 5, HORIZON - 250, 10, H - (HORIZON-250));
            ctx.fillStyle = '#240046'; // Reset
        }

        canvas.refresh();
    }

    // LAYER 2: MID SHELVES (Main Detail)
    private static generateMidShelves(scene: Phaser.Scene) {
        if (scene.textures.exists('bg_lib_mid')) return;
        const W = 1024, H = 1024; // Extended Height
        const HORIZON = 512;

        const canvas = scene.textures.createCanvas('bg_lib_mid', W, H);
        if (!canvas) return;
        const ctx = canvas.context;

        // 1. Main Wood Structure
        const colW = 140;
        const gap = 60;
        
        for (let x = 20; x < W; x += colW + gap) {
            // Wood Grain Gradient
            const woodGrd = ctx.createLinearGradient(x, 0, x + colW, 0);
            woodGrd.addColorStop(0, '#3e2723');
            woodGrd.addColorStop(0.5, '#5d4037');
            woodGrd.addColorStop(1, '#251612');
            ctx.fillStyle = woodGrd;
            
            // Main Column (Full Height)
            ctx.fillRect(x, 40, colW, H - 40);
            
            // Top Ornament (Crown)
            ctx.fillStyle = '#ffb300'; // Gold
            ctx.beginPath();
            ctx.moveTo(x - 10, 40);
            ctx.lineTo(x + colW + 10, 40);
            ctx.lineTo(x + colW, 60);
            ctx.lineTo(x, 60);
            ctx.fill();

            // Shelves & Books
            const shelfH = 50;
            const startY = 80;
            
            // Draw shelves all the way down
            for (let y = startY; y < H; y += shelfH) {
                // Shelf Plank
                ctx.fillStyle = '#180e0b';
                ctx.fillRect(x + 5, y + 35, colW - 10, 8);
                
                // Books
                let bx = x + 10;
                while (bx < x + colW - 15) {
                    // Randomize book size
                    const bW = 8 + Math.random() * 12;
                    const bH = 20 + Math.random() * 15;
                    const color = Phaser.Utils.Array.GetRandom(['#b71c1c', '#0d47a1', '#1b5e20', '#4a148c', '#3e2723', '#ff6f00']);
                    
                    ctx.fillStyle = color;
                    if (Math.random() > 0.8) {
                        ctx.save(); ctx.translate(bx, y + 35); ctx.rotate(-0.2); ctx.fillRect(0, -bH, bW, bH); ctx.restore(); bx += bW + 5;
                    } else {
                        ctx.fillRect(bx, y + 35 - bH, bW, bH);
                        if (Math.random() > 0.5) {
                            ctx.fillStyle = '#ffca28'; ctx.fillRect(bx + 2, y + 35 - bH + 5, bW - 4, 2); ctx.fillStyle = color;
                        }
                        bx += bW + 1;
                    }
                }
            }
        }

        canvas.refresh();
    }

    // LAYER 1: NEAR COLUMNS (Fast foreground parallax)
    private static generateNearColumns(scene: Phaser.Scene) {
        if (scene.textures.exists('bg_lib_near')) return;
        const W = 1024, H = 1024; // Extended
        const HORIZON = 512;

        const canvas = scene.textures.createCanvas('bg_lib_near', W, H);
        if (!canvas) return;
        const ctx = canvas.context;

        // Big Pillars that pass by
        const pW = 80;
        const gap = 400; 

        for (let x = 50; x < W; x += gap) {
            // Pillar Body (Marble) - Full Height
            const grd = ctx.createLinearGradient(x, 0, x + pW, 0);
            grd.addColorStop(0, '#4a148c'); // Deep Purple
            grd.addColorStop(0.5, '#7b1fa2'); // Lighter
            grd.addColorStop(1, '#280547'); // Shadow
            ctx.fillStyle = grd;
            ctx.fillRect(x, 0, pW, H);

            // Geometric Pattern Overlay (Zellige)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            for (let y = 0; y < H; y += 40) {
                ctx.beginPath();
                ctx.moveTo(x + pW/2, y);
                ctx.lineTo(x + pW, y + 20);
                ctx.lineTo(x + pW/2, y + 40);
                ctx.lineTo(x, y + 20);
                ctx.fill();
            }

            // Gold Trim Rings
            ctx.fillStyle = '#ffb300';
            ctx.fillRect(x - 5, 100, pW + 10, 15);
            ctx.fillRect(x - 5, 400, pW + 10, 15);
            ctx.fillRect(x - 5, 700, pW + 10, 15); // Extra lower ring

            // Hanging Lantern
            const lx = x + pW + 5;
            const ly = 115; 
            ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx, ly + 40); ctx.stroke();
            ctx.fillStyle = '#212121'; ctx.beginPath(); ctx.moveTo(lx, ly + 40); ctx.lineTo(lx - 10, ly + 60); ctx.lineTo(lx, ly + 80); ctx.lineTo(lx + 10, ly + 60); ctx.fill();
            ctx.fillStyle = '#00e5ff'; ctx.globalAlpha = 0.8; ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = 15; ctx.beginPath(); ctx.arc(lx, ly + 60, 5, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; ctx.globalAlpha = 1.0;
        }

        canvas.refresh();
    }

    private static generateLibraryGround(scene: Phaser.Scene) {
        if (scene.textures.exists('ground_library')) return;
        const W = 1024, H = 128;
        const canvas = scene.textures.createCanvas('ground_library', W, H);
        if (!canvas) return;
        const ctx = canvas.context;
        const grd = ctx.createLinearGradient(0, 0, 0, H);
        grd.addColorStop(0, '#4a148c'); grd.addColorStop(1, '#270838');
        ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(200, 0); ctx.lineTo(100, H); ctx.lineTo(-100, H); ctx.fill();
        ctx.beginPath(); ctx.moveTo(600, 0); ctx.lineTo(700, 0); ctx.lineTo(650, H); ctx.lineTo(550, H); ctx.fill();
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.15)'; ctx.lineWidth = 1;
        const size = 80;
        for (let x = 0; x < W; x += size) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + size/2, size/2); ctx.lineTo(x + size, 0); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x + size/2, size/2); ctx.lineTo(x + size/2, H); ctx.stroke();
        }
        const trimGrd = ctx.createLinearGradient(0, 0, 0, 8); trimGrd.addColorStop(0, '#ffd700'); trimGrd.addColorStop(1, '#ff6f00');
        ctx.fillStyle = trimGrd; ctx.fillRect(0, 0, W, 8);
        ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(0, 0, W, 1);
        canvas.refresh();
    }
}
