
import Phaser from 'phaser';

export class CamelCaravan {
    private scene: Phaser.Scene;
    private camels: Phaser.GameObjects.Group;
    private spawnTimer: number = 0;
    private isSpawning: boolean = true;
    
    // Config
    private readonly HORIZON_Y_OFFSET = 225; 
    private readonly CAMEL_SCALE = 0.55; 
    private readonly SPAWN_INTERVAL_MIN = 20000; 
    private readonly SPAWN_INTERVAL_MAX = 40000; 
    private nextSpawnTime: number = 5000;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.camels = scene.add.group({ runChildUpdate: false });
        CamelCaravan.generateTexture(scene);
    }

    public update(dt: number, scrollSpeed: number) {
        // Parallax speed: 0.02 (Matches bg_dune_3 in DesertLayers)
        const layerSpeed = scrollSpeed * 0.02;
        const walkSpeed = 15 * (dt/1000); // Slow walk against scroll
        const movement = layerSpeed + walkSpeed; 

        this.camels.children.each((child: any) => {
            const camel = child as Phaser.GameObjects.Sprite;
            camel.x -= movement;
            
            // Despawn
            if (camel.x < -100) {
                this.camels.remove(camel, true, true);
            }
            return true;
        });

        // Spawn Logic
        if (this.isSpawning) {
            this.spawnTimer += dt;
            if (this.spawnTimer > this.nextSpawnTime) {
                this.spawnCaravan();
                this.spawnTimer = 0;
                this.nextSpawnTime = Phaser.Math.Between(this.SPAWN_INTERVAL_MIN, this.SPAWN_INTERVAL_MAX);
            }
        }
    }

    public resize(width: number, height: number) {
        const yPos = height - this.HORIZON_Y_OFFSET;
        this.camels.children.each((child: any) => {
            child.y = yPos;
            return true;
        });
    }

    public setVisible(visible: boolean) {
        this.camels.setVisible(visible);
    }

    public stopSpawning() {
        this.isSpawning = false;
    }

    public fadeOut(duration: number) {
        // Stop spawning new ones
        this.isSpawning = false;
        
        // Fade out existing camels
        this.scene.tweens.add({
            targets: this.camels.getChildren(),
            alpha: 0,
            duration: duration,
            ease: 'Power2.inOut',
            onComplete: () => {
                this.camels.clear(true, true);
            }
        });
    }

    private spawnCaravan() {
        const { width, height } = this.scene.scale;
        const count = Phaser.Math.Between(3, 5);
        const startX = width + 100;
        const yPos = height - this.HORIZON_Y_OFFSET;

        for(let i=0; i<count; i++) {
            const x = startX + (i * 50); 
            
            const camel = this.scene.add.sprite(x, yPos, 'bg_camel');
            camel.setOrigin(0.5, 1); 
            camel.setScale(this.CAMEL_SCALE);
            
            // DEPTH: -35 (Between Dune 3 and Dune 2)
            camel.setDepth(-35); 
            
            camel.setTint(0x15100e); 
            
            const sVar = Phaser.Math.FloatBetween(0.9, 1.1);
            camel.setScale(this.CAMEL_SCALE * sVar);

            // Walking Bob
            this.scene.tweens.add({
                targets: camel,
                y: yPos - 2,
                duration: 600 + Math.random() * 200,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: i * 300
            });

            // Head Bob
            this.scene.tweens.add({
                targets: camel,
                angle: { from: -2, to: 2 },
                duration: 1000 + Math.random() * 500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: i * 150
            });

            this.camels.add(camel);
        }
    }

    static generateTexture(scene: Phaser.Scene) {
        if (scene.textures.exists('bg_camel')) return;

        const W = 64;
        const H = 64;
        const canvas = scene.textures.createCanvas('bg_camel', W, H);
        if (!canvas) return;
        const ctx = canvas.context;

        ctx.fillStyle = '#ffffff';

        const cx = 32;
        const cy = 35; 

        ctx.beginPath();
        // Body
        ctx.ellipse(cx + 5, cy, 18, 12, 0, 0, Math.PI*2);
        // Hump
        ctx.ellipse(cx + 5, cy - 12, 8, 10, -0.2, 0, Math.PI*2);
        // Neck
        ctx.moveTo(cx - 10, cy - 5);
        ctx.quadraticCurveTo(cx - 20, cy, cx - 25, cy - 15); 
        ctx.lineTo(cx - 22, cy - 15);
        ctx.quadraticCurveTo(cx - 15, cy - 5, cx - 5, cy - 8);
        // Head
        ctx.ellipse(cx - 26, cy - 18, 6, 4, 0.2, 0, Math.PI*2);
        ctx.moveTo(cx - 30, cy - 16); ctx.lineTo(cx - 32, cy - 15); // Snout
        ctx.moveTo(cx - 24, cy - 21); ctx.lineTo(cx - 24, cy - 23); // Ear

        // Legs
        const legW = 3;
        const legH = 20;
        ctx.rect(cx - 10, cy + 5, legW, legH);
        ctx.rect(cx - 5, cy + 6, legW, legH - 2);
        ctx.rect(cx + 15, cy + 5, legW, legH);
        ctx.rect(cx + 20, cy + 6, legW, legH - 2);

        // Tail
        ctx.moveTo(cx + 22, cy - 5);
        ctx.quadraticCurveTo(cx + 25, cy, cx + 24, cy + 8);
        ctx.lineTo(cx + 22, cy + 8); 

        ctx.fill();
        canvas.refresh();
    }
}
