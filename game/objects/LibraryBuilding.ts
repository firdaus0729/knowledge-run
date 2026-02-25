
import Phaser from 'phaser';
import { BuildingGenerator } from '../generators/BuildingGenerator';

export class LibraryBuilding extends Phaser.GameObjects.Container {
  declare x: number;
  declare y: number;
  declare add: (child: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]) => this;
  declare setDepth: (value: number) => this;
  declare setScale: (x: number, y?: number) => this;
  declare destroy: (fromScene?: boolean) => void;
  declare active: boolean;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    BuildingGenerator.init(scene); // Ensure texture exists

    const exterior = scene.add.sprite(0, 0, 'library_exterior');
    exterior.setOrigin(0.5, 1);
    this.add(exterior);

    // Inner Glow (Open door inviting player)
    const glow = scene.add.image(0, -100, 'city_lamp_glow');
    glow.setBlendMode(Phaser.BlendModes.ADD);
    glow.setAlpha(0.6);
    glow.setScale(3, 4);
    glow.setTint(0xffd700); // Gold light
    this.add(glow);

    // Pulse effect
    scene.tweens.add({
        targets: glow,
        alpha: 0.8,
        scaleX: 3.2,
        duration: 1500,
        yoyo: true,
        repeat: -1
    });

    this.setDepth(15); // Behind player (20), but in front of bg
    // Adjusted scale since the new texture is larger (700px high)
    this.setScale(1.0); 
  }
}
