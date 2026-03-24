import Phaser from 'phaser';

/** Reward box on the elevated bridge: collect by reaching the top; gives bonus stars. */
export class RewardBox extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  declare scene: Phaser.Scene;
  declare x: number;
  declare y: number;
  declare setDepth: (value: number) => this;
  declare destroy: (fromScene?: boolean) => void;
  declare disableBody: (disableGameObject?: boolean, hideGameObject?: boolean) => this;

  static readonly BONUS_STARS = 15;

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

  /** Collect: show puzzle; score is added only when the player answers correctly (in MainScene.resolvePuzzle). */
  collect() {
    this.disableBody(true, true);
    const scene = this.scene as any;
    if (scene.showPuzzle) {
      scene.showPuzzle({
        id: `bridge_box_${Date.now()}`,
        type: 'BRIDGE_BOX',
        mode: 'MCQ',
        prompt: 'ما الذي يرمز إلى المكافأة؟',
        options: ['⭐', '📦', '🗝️'],
        correctIndex: 1,
        timeoutMs: 8000,
      });
    }
    this.destroy();
  }

  static generateTexture(scene: Phaser.Scene) {
    if (scene.textures.exists('reward_box')) return;
    const w = 48;
    const h = 44;
    const canvas = scene.textures.createCanvas('reward_box', w, h);
    if (!canvas) return;
    const ctx = canvas.context;
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(4, 8, w - 8, h - 16);
    ctx.strokeStyle = '#D2691E';
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 8, w - 8, h - 16);
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(6, 6, w - 12, 10);
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 1;
    ctx.strokeRect(6, 6, w - 12, 10);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('?', w / 2, h / 2 + 6);
    canvas.refresh();
  }
}
