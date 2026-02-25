
import Phaser from 'phaser';
import { LibraryAssetGenerator } from '../../generators/LibraryAssetGenerator';

export class LibraryLayers {
    private scene: Phaser.Scene;
    
    private bgFar!: Phaser.GameObjects.TileSprite;
    private bgMid!: Phaser.GameObjects.TileSprite;
    private bgNear!: Phaser.GameObjects.TileSprite;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        LibraryAssetGenerator.init(scene);
    }

    public create(width: number, height: number) {
        // 1. Far Layer (Arches) - Slowest
        this.bgFar = this.scene.add.tileSprite(0, 0, width, 1024, 'bg_lib_far');
        this.bgFar.setOrigin(0, 0);
        this.bgFar.setScrollFactor(0);
        this.bgFar.setAlpha(0); 
        this.bgFar.setDepth(-58); 

        // 2. Mid Layer (Shelves) - Standard
        this.bgMid = this.scene.add.tileSprite(0, 0, width, 1024, 'bg_lib_mid');
        this.bgMid.setOrigin(0, 0);
        this.bgMid.setScrollFactor(0);
        this.bgMid.setAlpha(0); 
        this.bgMid.setDepth(-55);

        // 3. Near Layer (Columns) - Faster
        this.bgNear = this.scene.add.tileSprite(0, 0, width, 1024, 'bg_lib_near');
        this.bgNear.setOrigin(0, 0);
        this.bgNear.setScrollFactor(0);
        this.bgNear.setAlpha(0); 
        this.bgNear.setDepth(-52);

        this.resize(width, height);
    }

    public resize(width: number, height: number) {
        const horizonOffset = 512;
        const groundHeight = 120;
        const yPos = (height - groundHeight) - horizonOffset;

        const setLayer = (layer: Phaser.GameObjects.TileSprite) => {
            if (layer) {
                layer.setPosition(0, yPos);
                layer.width = width;
            }
        };
        
        setLayer(this.bgFar);
        setLayer(this.bgMid);
        setLayer(this.bgNear);
    }

    public update(speed: number) {
        // Only update parallax if visible
        if (this.bgMid.alpha > 0 || this.bgMid.visible) {
            this.bgFar.tilePositionX += speed * 0.05;  // Very slow depth
            this.bgMid.tilePositionX += speed * 0.15;  // Main scrolling speed
            this.bgNear.tilePositionX += speed * 0.3;  // Fast foreground passing
        }
    }

    public fadeIn(duration: number) {
        this.scene.tweens.add({
            targets: [this.bgFar, this.bgMid, this.bgNear],
            alpha: 1,
            duration: duration,
            ease: 'Power2.inOut'
        });
    }
    
    public fadeOut(duration: number) {
        this.scene.tweens.add({
            targets: [this.bgFar, this.bgMid, this.bgNear],
            alpha: 0,
            duration: duration,
            ease: 'Power2.inOut'
        });
    }
}
