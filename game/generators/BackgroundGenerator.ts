
import Phaser from 'phaser';
import { AtmosphereGenerator } from './AtmosphereGenerator';
import { DesertAssetGenerator } from './DesertAssetGenerator';
import { CityAssetGenerator } from './CityAssetGenerator';

/**
 * @deprecated Use AtmosphereGenerator, DesertAssetGenerator, or CityAssetGenerator directly.
 */
export class BackgroundGenerator {
    static init(scene: Phaser.Scene) {
        AtmosphereGenerator.init(scene);
        DesertAssetGenerator.init(scene);
        CityAssetGenerator.init(scene);
    }
}
