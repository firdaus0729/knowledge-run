
import Phaser from 'phaser';
import { CityAssetGenerator } from '../../generators/CityAssetGenerator';
import type { CitySegment } from '../../managers/EnvironmentManager';

/**
 * Step 5 – City parallax environment.
 *
 * Uses three visual layers to create depth:
 * - Far: soft skyline of domes / towers.
 * - Mid: main building masses with lit windows.
 * - Near: dark rooftop silhouettes.
 *
 * Segment changes (entrance → streets → market → Bayt) adjust alphas to make
 * the city feel richer as the player runs deeper into Stage 2.
 */
export class CityLayers {
    private scene: Phaser.Scene;
    private bgCityFar!: Phaser.GameObjects.TileSprite;
    private bgCityMid!: Phaser.GameObjects.TileSprite;
    private bgCityNear!: Phaser.GameObjects.TileSprite;
    private bgCityLights!: Phaser.GameObjects.TileSprite;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        CityAssetGenerator.init(scene);
    }

    public create(width: number, height: number) {
        // 1. FAR LAYER – soft skyline (reuse cityMid but dimmer and slower)
        this.bgCityFar = this.scene.add.tileSprite(0, 0, width, 1024, 'cityMid');
        this.bgCityFar.setOrigin(0, 0);
        this.bgCityFar.setScrollFactor(0);
        this.bgCityFar.setAlpha(0); 
        this.bgCityFar.setDepth(-70);
        this.bgCityFar.setTintFill(0x9281b8); // Slightly cooler / more distant tint

        // 2. MID LAYER – main blocks (cityMid, normal tint)
        this.bgCityMid = this.scene.add.tileSprite(0, 0, width, 1024, 'cityMid');
        this.bgCityMid.setOrigin(0, 0);
        this.bgCityMid.setScrollFactor(0);
        this.bgCityMid.setAlpha(0); 
        this.bgCityMid.setDepth(-60);

        // 3. NEAR LAYER – rooftop silhouettes (cityNear)
        this.bgCityNear = this.scene.add.tileSprite(0, 0, width, 1024, 'cityNear');
        this.bgCityNear.setOrigin(0, 0);
        this.bgCityNear.setScrollFactor(0);
        this.bgCityNear.setAlpha(0);
        this.bgCityNear.setDepth(-55);

        // 4. LIGHTS OVERLAY – adds warm window glow over mid / near
        this.bgCityLights = this.scene.add.tileSprite(0, 0, width, 1024, 'cityLights');
        this.bgCityLights.setOrigin(0, 0);
        this.bgCityLights.setScrollFactor(0);
        this.bgCityLights.setBlendMode(Phaser.BlendModes.ADD);
        this.bgCityLights.setAlpha(0); 
        this.bgCityLights.setDepth(-59);

        this.resize(width, height);
    }

    public resize(width: number, height: number) {
        // We want the horizon line (512px down the texture) to sit at `height - 120` on screen.
        const horizonOffset = 512;
        const groundHeight = 120;
        const yPos = (height - groundHeight) - horizonOffset;

        const positionLayer = (layer: Phaser.GameObjects.TileSprite | undefined) => {
            if (!layer) return;
            layer.setPosition(0, yPos);
            layer.width = width;
        };

        positionLayer(this.bgCityFar);
        positionLayer(this.bgCityMid);
        positionLayer(this.bgCityNear);
        positionLayer(this.bgCityLights);
    }

    public update(speed: number) {
        // Only update parallax if visible or becoming visible
        if (!this.bgCityMid || this.bgCityMid.alpha <= 0) return;

        this.bgCityFar.tilePositionX += speed * 0.04;  // very slow depth
        this.bgCityMid.tilePositionX += speed * 0.10;  // main scroll
        this.bgCityNear.tilePositionX += speed * 0.18; // fastest foreground skyline
        this.bgCityLights.tilePositionX += speed * 0.10;
    }

    public fadeIn(duration: number) {
        this.scene.tweens.add({
            targets: [this.bgCityFar, this.bgCityMid, this.bgCityNear, this.bgCityLights],
            alpha: 1,
            duration: duration,
            ease: 'Power2.inOut'
        });
    }
    
    public fadeOut(duration: number) {
        this.scene.tweens.add({
            targets: [this.bgCityFar, this.bgCityMid, this.bgCityNear, this.bgCityLights],
            alpha: 0,
            duration: duration,
            ease: 'Power2.inOut'
        });
    }

    /**
     * Adjust layer emphasis based on where we are in the city.
     * - Entrance: mostly far/mid, almost no near / lights.
     * - Street: enable some near, modest lights.
     * - Market: strong near + bright lights.
     * - Bayt: calmer lights, balanced near, clearer far skyline.
     */
    public applySegment(segment: CitySegment) {
        if (!this.bgCityFar) return;
        let farAlpha = 1;
        let midAlpha = 1;
        let nearAlpha = 0.2;
        let lightsAlpha = 0.25;

        if (segment === 'CITY_ENTRANCE') {
            nearAlpha = 0.05;
            lightsAlpha = 0.15;
        } else if (segment === 'CITY_STREET') {
            nearAlpha = 0.25;
            lightsAlpha = 0.25;
        } else if (segment === 'CITY_MARKET') {
            nearAlpha = 0.45;
            lightsAlpha = 0.45;
        } else if (segment === 'CITY_BAYT') {
            farAlpha = 1.0;
            midAlpha = 0.95;
            nearAlpha = 0.35;
            lightsAlpha = 0.30;
        }

        this.scene.tweens.add({
            targets: this.bgCityFar,
            alpha: farAlpha,
            duration: 600,
            ease: 'Sine.easeInOut'
        });
        this.scene.tweens.add({
            targets: this.bgCityMid,
            alpha: midAlpha,
            duration: 600,
            ease: 'Sine.easeInOut'
        });
        this.scene.tweens.add({
            targets: this.bgCityNear,
            alpha: nearAlpha,
            duration: 600,
            ease: 'Sine.easeInOut'
        });
        this.scene.tweens.add({
            targets: this.bgCityLights,
            alpha: lightsAlpha,
            duration: 600,
            ease: 'Sine.easeInOut'
        });
    }

    public setFlightMode(active: boolean, duration: number = 1000) {
        // For carpet rides we keep the skyline visible; optional vertical parallax could be added here.
        // Currently left as a no-op to avoid jarring motion during flight.
    }
}
