
import Phaser from 'phaser';
import { DesertAssetGenerator } from '../../generators/DesertAssetGenerator';
import { CamelCaravan } from '../CamelCaravan';

export class DesertLayers {
    private scene: Phaser.Scene;
    
    // 3 Layers of sand
    private dune3!: Phaser.GameObjects.TileSprite; // Far
    private dune2!: Phaser.GameObjects.TileSprite; // Mid
    private dune1!: Phaser.GameObjects.TileSprite; // Near
    
    private camelCaravan: CamelCaravan;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        DesertAssetGenerator.init(scene);
        this.camelCaravan = new CamelCaravan(scene);
    }

    public create(width: number, height: number) {
        // Layer 3: Far Dunes (Camels walk on/behind this ridge)
        this.dune3 = this.scene.add.tileSprite(0, 0, width, 512, 'bg_dune_3');
        this.dune3.setOrigin(0, 1);
        this.dune3.setScrollFactor(0);
        this.dune3.setDepth(-40); 

        // Layer 2: Mid Dunes (Obscures Camels feet)
        this.dune2 = this.scene.add.tileSprite(0, 0, width, 512, 'bg_dune_2');
        this.dune2.setOrigin(0, 1);
        this.dune2.setScrollFactor(0);
        this.dune2.setDepth(-30);

        // Layer 1: Near Dunes (Foreground detail)
        this.dune1 = this.scene.add.tileSprite(0, 0, width, 512, 'bg_dune_1');
        this.dune1.setOrigin(0, 1);
        this.dune1.setScrollFactor(0);
        this.dune1.setDepth(-20);

        this.resize(width, height);
        
        // Camels are set to depth -35 in their class to sit between Dune 3 (-40) and Dune 2 (-30)
    }

    public resize(width: number, height: number) {
        const setLayer = (layer: Phaser.GameObjects.TileSprite) => {
            if (layer) {
                layer.setPosition(0, height);
                layer.width = width;
            }
        };

        setLayer(this.dune3);
        setLayer(this.dune2);
        setLayer(this.dune1);
        
        if (this.camelCaravan) {
            this.camelCaravan.resize(width, height);
        }
    }

    public update(speed: number) {
        const dt = 16.6; 

        if (this.dune3 && this.dune3.active) {
            this.dune3.tilePositionX += speed * 0.02; // Slow
            this.dune2.tilePositionX += speed * 0.05; // Mid
            this.dune1.tilePositionX += speed * 0.1;  // Fast
            
            // Pass speed * 0.02 to camels to match the layer they are "walking" on (Dune 3)
            this.camelCaravan.update(dt, speed);
        }
    }

    public fadeOut(duration: number) {
        // Trigger camel fade out immediately
        this.camelCaravan.fadeOut(duration);

        this.scene.tweens.add({
            targets: [this.dune3, this.dune2, this.dune1],
            alpha: 0,
            duration: duration,
            ease: 'Power2.inOut'
        });
    }
}
