
import Phaser from 'phaser';
import { CityAssetGenerator } from '../../generators/CityAssetGenerator';

export class CityLayers {
    private scene: Phaser.Scene;
    private bgCityMid!: Phaser.GameObjects.TileSprite;
    private bgCityLights!: Phaser.GameObjects.TileSprite;
    // bgCityNear removed as requested

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        CityAssetGenerator.init(scene);
    }

    public create(width: number, height: number) {
        // 1. Mid City Skyline (Silhouettes of domes/towers)
        // Texture is 1024px tall. Horizon at 512px.
        this.bgCityMid = this.scene.add.tileSprite(0, 0, width, 1024, 'cityMid');
        this.bgCityMid.setOrigin(0, 0); // Top Left
        this.bgCityMid.setScrollFactor(0);
        this.bgCityMid.setAlpha(0); 
        this.bgCityMid.setDepth(-60);

        // 2. Mid City Lights (Windows Overlay)
        this.bgCityLights = this.scene.add.tileSprite(0, 0, width, 1024, 'cityLights');
        this.bgCityLights.setOrigin(0, 0);
        this.bgCityLights.setScrollFactor(0);
        this.bgCityLights.setBlendMode(Phaser.BlendModes.ADD);
        this.bgCityLights.setAlpha(0); 
        this.bgCityLights.setDepth(-59);

        // Near layer removed

        this.resize(width, height);
    }

    public resize(width: number, height: number) {
        // We want the horizon line (512px down the texture) to sit at `height - 120` on screen.
        // Y = ScreenHorizon - TextureHorizon
        // Y = (height - 120) - 512
        const horizonOffset = 512;
        const groundHeight = 120;
        const yPos = (height - groundHeight) - horizonOffset;

        if (this.bgCityMid) {
            this.bgCityMid.setPosition(0, yPos);
            this.bgCityMid.width = width;
        }
        if (this.bgCityLights) {
            this.bgCityLights.setPosition(0, yPos);
            this.bgCityLights.width = width;
        }
    }

    public update(speed: number) {
        // Only update parallax if visible or becoming visible
        if (this.bgCityMid.alpha > 0 || this.bgCityMid.visible) {
            this.bgCityMid.tilePositionX += speed * 0.1; 
            this.bgCityLights.tilePositionX += speed * 0.1; 
        }
    }

    public fadeIn(duration: number) {
        this.scene.tweens.add({
            targets: [this.bgCityMid, this.bgCityLights],
            alpha: 1,
            duration: duration,
            ease: 'Power2.inOut'
        });
    }

    public fadeOut(duration: number) {
        this.scene.tweens.add({
            targets: [this.bgCityMid, this.bgCityLights],
            alpha: 0,
            duration: duration,
            ease: 'Power2.inOut'
        });
    }

    public setFlightMode(active: boolean, duration: number = 1000) {
        // With the new "Infinite Stretch" textures, we don't need to hide the layers anymore.
        // We just leave them there. The 512px+ part of the texture acts as the foundation.
        
        // Optional: If we want parallax vertical movement to simulate climbing higher:
        // When active, we could tween Y down slightly, but for now let's just keep it stable.
        // The foreground buildings (Foreground.ts) are destroyed, so this layer is the only thing left.
    }
}
