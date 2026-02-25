
import Phaser from 'phaser';

export class AtmosphereGenerator {
    static init(scene: Phaser.Scene) {
        this.generateSkyTexture(scene);
        this.generateMoonTexture(scene);
        this.generateStarTexture(scene);
        this.generateCloudTexture(scene);
        this.generateHazeTexture(scene);
        this.generateSandstormTexture(scene);
    }

    private static generateSkyTexture(scene: Phaser.Scene) {
        if (scene.textures.exists('skyGradient_fixed')) return;
        
        const W = 32;
        const H = 512;
        const canvas = scene.textures.createCanvas('skyGradient_fixed', W, H);
        if (!canvas) return;
        const ctx = canvas.context;

        // Vibrant Royal Night Sky
        const grd = ctx.createLinearGradient(0, 0, 0, H);
        grd.addColorStop(0.0, '#0f0c29'); // Night Blue/Black
        grd.addColorStop(0.4, '#302b63'); // Deep Blue
        grd.addColorStop(0.8, '#5e4b8b'); // Soft Purple Horizon
        grd.addColorStop(1.0, '#281a42'); // Ground Blend
        
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);
        
        canvas.refresh();
    }

    private static generateSandstormTexture(scene: Phaser.Scene) {
        if (scene.textures.exists('sandstorm_overlay')) return;
        
        // Full screen noise texture
        const W = 512, H = 512;
        const canvas = scene.textures.createCanvas('sandstorm_overlay', W, H);
        if (!canvas) return;
        const ctx = canvas.context;

        // Base orange dust
        ctx.fillStyle = '#d68f50';
        ctx.fillRect(0, 0, W, H);

        // Heavy Noise
        for (let i = 0; i < 50000; i++) {
            const x = Math.random() * W;
            const y = Math.random() * H;
            const alpha = Math.random() * 0.3;
            // Darker specs
            ctx.fillStyle = `rgba(100, 50, 0, ${alpha})`;
            ctx.fillRect(x, y, 2, 1);
            // Lighter specs
            if (i % 2 === 0) {
                ctx.fillStyle = `rgba(255, 200, 150, ${alpha})`;
                ctx.fillRect(x, y, 2, 1);
            }
        }
        
        canvas.refresh();
    }

    private static generateMoonTexture(scene: Phaser.Scene) {
        if (scene.textures.exists('moon')) return;
        
        const S = 128;
        const canvas = scene.textures.createCanvas('moon', S, S);
        if (!canvas) return;
        const ctx = canvas.context;
        const cx = S/2, cy = S/2, r = 40;

        const glow = ctx.createRadialGradient(cx, cy, r, cx, cy, S/2);
        glow.addColorStop(0, 'rgba(255, 255, 200, 0.25)'); // Warm glow
        glow.addColorStop(1, 'rgba(255, 255, 200, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0,0,S,S);

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI*2);
        ctx.fillStyle = '#fff9c4'; 
        ctx.fill();

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(cx - 10, cy - 5, r - 2, 0, Math.PI*2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';

        canvas.refresh();
    }

    private static generateStarTexture(scene: Phaser.Scene) {
        if (scene.textures.exists('star')) return;
        const canvas = scene.textures.createCanvas('star', 8, 8);
        const ctx = canvas.context;
        
        const grd = ctx.createRadialGradient(4, 4, 0, 4, 4, 4);
        grd.addColorStop(0, 'rgba(255,255,255,1)'); // Maximum brightness
        grd.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grd;
        ctx.fillRect(0,0,8,8);
        
        canvas.refresh();
    }

    private static generateCloudTexture(scene: Phaser.Scene) {
        if (scene.textures.exists('bg_cloud')) return;
        const W = 512, H = 256;
        const canvas = scene.textures.createCanvas('bg_cloud', W, H);
        if (!canvas) return;
        const ctx = canvas.context;

        const drawCloud = (cx: number, cy: number, r: number) => {
            const grd = ctx.createRadialGradient(cx, cy, r*0.2, cx, cy, r);
            grd.addColorStop(0, 'rgba(179, 157, 219, 0.12)'); // Tinted Lavender
            grd.addColorStop(1, 'rgba(179, 157, 219, 0)');
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI*2);
            ctx.fill();
        };

        for(let i=0; i<5; i++) {
            const x = Phaser.Math.Between(100, W-100);
            const y = Phaser.Math.Between(50, H-50);
            const r = Phaser.Math.Between(60, 100);
            ctx.save();
            ctx.translate(x, y);
            ctx.scale(3.0, 0.5); 
            drawCloud(0, 0, r);
            ctx.restore();
        }

        canvas.refresh();
    }

    private static generateHazeTexture(scene: Phaser.Scene) {
        if (scene.textures.exists('bg_haze')) return;
        const W = 32, H = 256;
        const canvas = scene.textures.createCanvas('bg_haze', W, H);
        if (!canvas) return;
        const ctx = canvas.context;

        const grd = ctx.createLinearGradient(0, 0, 0, H);
        grd.addColorStop(0, 'rgba(0,0,0,0)');
        grd.addColorStop(0.3, 'rgba(103, 58, 183, 0)'); 
        grd.addColorStop(0.7, 'rgba(103, 58, 183, 0.25)'); // Deep Purple Haze
        grd.addColorStop(1, 'rgba(49, 27, 146, 0.9)'); 
        
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);
        canvas.refresh();
    }
}
