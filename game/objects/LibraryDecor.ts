
import Phaser from 'phaser';

export type DecorType = 'CANDELABRA' | 'GLOBE' | 'SCROLL_RACK';

export class LibraryDecor extends Phaser.GameObjects.Container {
  declare add: (child: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]) => this;
  declare setDepth: (value: number) => this;
  declare setScale: (x: number, y?: number) => this;

  constructor(scene: Phaser.Scene, x: number, y: number, type: DecorType) {
    super(scene, x, y);
    scene.add.existing(this);

    let key = '';
    let originY = 1;

    switch (type) {
        case 'CANDELABRA': key = 'library_candelabra'; break;
        case 'GLOBE': key = 'library_globe'; break;
        case 'SCROLL_RACK': key = 'library_scroll_rack'; break;
    }

    const sprite = scene.add.sprite(0, 0, key);
    sprite.setOrigin(0.5, originY);
    this.add(sprite);

    // Add gentle flickering light for candelabra
    if (type === 'CANDELABRA') {
        const glow = scene.add.image(0, -200, 'fg_lamp_light'); // Reuse existing light texture
        glow.setBlendMode(Phaser.BlendModes.ADD);
        glow.setAlpha(0.4);
        glow.setScale(1.5);
        this.add(glow);
        
        scene.tweens.add({
            targets: glow,
            alpha: 0.6,
            scale: 1.6,
            duration: 100 + Math.random() * 200,
            yoyo: true,
            repeat: -1
        });
    }

    // Set Depth (Background of play area)
    this.setDepth(9); 
    this.setScale(Phaser.Math.FloatBetween(0.9, 1.1));
  }
}
