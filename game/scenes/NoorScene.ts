import Phaser from 'phaser';
import { Noor } from '../objects/Noor';

export class NoorScene extends Phaser.Scene {
    declare load: Phaser.Loader.LoaderPlugin;
    declare scale: Phaser.Scale.ScaleManager;
    declare add: Phaser.GameObjects.GameObjectFactory;
    declare textures: Phaser.Textures.TextureManager;
    declare tweens: Phaser.Tweens.TweenManager;
    declare data: Phaser.Data.DataManager;
    declare time: Phaser.Time.Clock;

    private noor!: Noor;
    private overlay!: Phaser.GameObjects.Graphics;

    constructor() {
        super({ key: 'NoorScene' });
    }

    preload() {
        // Load the uploaded character image from external URL
        this.load.crossOrigin = 'anonymous';
        this.load.image('noor_asset', 'https://ucarecdn.com/64926886-4015-49f7-9ebc-f3f206cf82e0/Gemini_Generated_Image_x273efx273efx273removebgpreview.png');
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        // Create Enhanced Overlay
        // Instead of flat black, use a radial gradient that is brighter on the right side (where Noor is)
        this.overlay = this.add.graphics();
        this.overlay.setDepth(0);
        this.overlay.setAlpha(0); // Start hidden
        
        // Draw Radial Gradient manually using texture or canvas, but for Graphics we simulate with fill
        // Actually, let's create a texture for the gradient overlay for performance
        if (!this.textures.exists('noor_overlay_bg')) {
            const canvas = this.textures.createCanvas('noor_overlay_bg', 512, 512);
            if (canvas) {
                const ctx = canvas.context;
                // Radial gradient centered on the right side
                const grd = ctx.createRadialGradient(400, 256, 100, 256, 256, 400);
                grd.addColorStop(0, 'rgba(45, 38, 64, 0.4)'); // Lighter purple near Noor
                grd.addColorStop(1, 'rgba(0, 0, 0, 0.85)');   // Dark edges
                ctx.fillStyle = grd;
                ctx.fillRect(0,0,512,512);
                canvas.refresh();
            }
        }
        
        const bg = this.add.image(width/2, height/2, 'noor_overlay_bg');
        bg.setDisplaySize(width, height);
        bg.setDepth(0);
        bg.setAlpha(0);
        
        // We reference this image in the tween
        this.tweens.add({
            targets: bg,
            alpha: 1,
            duration: 600,
            ease: 'Sine.easeInOut'
        });

        // Noor Character
        this.noor = new Noor(this);
        this.noor.setDepth(10);
        this.noor.appear();
        
        // Save ref for dismissal
        this.data.set('bg', bg);
    }
    
    // Method to cleanly exit this scene
    public dismiss(onComplete: () => void) {
        const bg = this.data.get('bg') as Phaser.GameObjects.Image;
        
        // Fade out overlay
        if (bg) {
            this.tweens.add({
                targets: bg,
                alpha: 0,
                duration: 500
            });
        }
        
        // Slide Noor out
        this.noor.dismiss();
        
        // Wait for animation then callback
        this.time.delayedCall(600, () => {
            onComplete();
        });
    }
}