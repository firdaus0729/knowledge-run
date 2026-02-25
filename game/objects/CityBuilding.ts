
import Phaser from 'phaser';
import { BuildingGenerator } from '../generators/BuildingGenerator';

export class CityBuilding extends Phaser.GameObjects.Container {
  declare name: string;
  declare add: (child: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]) => this;
  declare addAt: (child: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[], index?: number) => this;
  declare setDepth: (value: number) => this;
  declare setScale: (x: number, y?: number) => this;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    // Randomize Building Type
    // 1-3: Market Stalls (Variants), 4: Pottery, 5: Rugs
    const typeRoll = Phaser.Math.Between(1, 5);
    let key = '';

    if (typeRoll <= 3) {
        const variant = Phaser.Utils.Array.GetRandom(['A', 'B', 'C']);
        key = `building_stall_${variant}`;
    } else if (typeRoll === 4) {
        key = 'building_pottery';
    } else {
        key = 'building_rugs';
    }

    const structure = scene.add.sprite(0, 0, key);
    structure.setOrigin(0.5, 1);
    
    if (Math.random() > 0.5) {
        structure.setFlipX(true);
    }

    this.add(structure);

    const glow = scene.add.image(0, -100, 'city_lamp_glow'); 
    glow.setOrigin(0.5, 0.5);
    glow.setScale(3, 2);
    glow.setAlpha(0.3);
    glow.setBlendMode(Phaser.BlendModes.ADD);
    this.addAt(glow, 0); 

    this.setDepth(9); 
    this.setScale(Phaser.Math.FloatBetween(0.95, 1.05));
  }

  static generateTextures(scene: Phaser.Scene) {
      // Delegate to the new Generator class
      BuildingGenerator.init(scene);
  }
}
