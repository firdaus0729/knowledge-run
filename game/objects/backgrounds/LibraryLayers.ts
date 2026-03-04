
import Phaser from 'phaser';
import { LibraryAssetGenerator } from '../../generators/LibraryAssetGenerator';

export class LibraryLayers {
    private scene: Phaser.Scene;

    private bgFar!: Phaser.GameObjects.TileSprite;
    private bgMid!: Phaser.GameObjects.TileSprite;
    private bgNear!: Phaser.GameObjects.TileSprite;
    private bgDome!: Phaser.GameObjects.Image;
    private patternOverlay!: Phaser.GameObjects.TileSprite;
    private goldenOverlay!: Phaser.GameObjects.Image;

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

        // 4. Dome silhouette (subtle Islamic dome, behind far)
        this.bgDome = this.scene.add.image(width / 2, 0, 'bg_lib_dome');
        this.bgDome.setOrigin(0.5, 0);
        this.bgDome.setScrollFactor(0);
        this.bgDome.setAlpha(0);
        this.bgDome.setDepth(-59);

        // 5. Andalusian pattern overlay (5–8% opacity)
        this.patternOverlay = this.scene.add.tileSprite(0, 0, width, 1024, 'bg_lib_pattern');
        this.patternOverlay.setOrigin(0, 0);
        this.patternOverlay.setScrollFactor(0);
        this.patternOverlay.setAlpha(0);
        this.patternOverlay.setDepth(-51);

        // 6. Warm golden ambient
        this.goldenOverlay = this.scene.add.image(width / 2, 512, 'bg_lib_golden');
        this.goldenOverlay.setOrigin(0.5, 0.5);
        this.goldenOverlay.setScrollFactor(0);
        this.goldenOverlay.setAlpha(0);
        this.goldenOverlay.setDepth(-50);

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

        if (this.patternOverlay) {
            this.patternOverlay.setPosition(0, yPos);
            this.patternOverlay.width = width;
        }
        if (this.bgDome) {
            this.bgDome.setPosition(width / 2, yPos + 80);
        }
        if (this.goldenOverlay) {
            this.goldenOverlay.setPosition(width / 2, height / 2);
            this.goldenOverlay.setDisplaySize(width + 100, height + 100);
        }
    }

    public update(speed: number) {
        if (this.bgMid.alpha > 0 || this.bgMid.visible) {
            this.bgFar.tilePositionX += speed * 0.05;
            this.bgMid.tilePositionX += speed * 0.15;
            this.bgNear.tilePositionX += speed * 0.3;
            this.patternOverlay.tilePositionX += speed * 0.04;
        }
    }

    private allLayers(): Phaser.GameObjects.GameObject[] {
        return [this.bgFar, this.bgMid, this.bgNear, this.bgDome, this.patternOverlay, this.goldenOverlay];
    }

    public fadeIn(duration: number) {
        this.bgDome.setAlpha(0);
        this.goldenOverlay.setAlpha(0);
        this.scene.tweens.add({
            targets: [this.bgFar, this.bgMid, this.bgNear, this.bgDome],
            alpha: 1,
            duration,
            ease: 'Power2.inOut'
        });
        this.scene.tweens.add({
            targets: this.patternOverlay,
            alpha: 0.07,
            duration,
            ease: 'Power2.inOut'
        });
        this.scene.tweens.add({
            targets: this.goldenOverlay,
            alpha: 0.15,
            duration,
            ease: 'Power2.inOut'
        });
    }

    public fadeOut(duration: number) {
        this.scene.tweens.add({
            targets: this.allLayers(),
            alpha: 0,
            duration: duration,
            ease: 'Power2.inOut'
        });
    }
}
