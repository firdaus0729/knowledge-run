import Phaser from 'phaser';

/** Box on the city running course: solve puzzle to earn a magic carpet ride. */
export class CityCarpetBox extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  declare scene: Phaser.Scene;
  declare x: number;
  declare y: number;
  declare setDepth: (value: number) => this;
  declare destroy: (fromScene?: boolean) => void;
  declare disableBody: (disableGameObject?: boolean, hideGameObject?: boolean) => this;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'reward_box');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(15);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setSize(32, 32);
    body.setOffset(8, 8);

    scene.tweens.add({
      targets: this,
      y: y - 8,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  update(speed: number) {
    this.x -= speed;
    if (this.x < -80) this.destroy();
  }

  collect() {
    this.disableBody(true, true);
    const scene = this.scene as any;
    if (scene.showPuzzle) {
      scene.showPuzzle({
        type: 'CITY_CARPET_BOX',
        prompt: 'اختر الرمز الذي يمثّل البساط السحري لتحلق فوق المدينة!',
        options: ['🧞‍♂️', '⚔️', '📚'],
        correctIndex: 0,
        timeoutMs: 8000,
      });
    }
    this.destroy();
  }
}
