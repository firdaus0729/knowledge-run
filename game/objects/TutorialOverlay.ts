import Phaser from 'phaser';

export class TutorialOverlay extends Phaser.GameObjects.Container {
  declare scene: Phaser.Scene;
  declare add: (child: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]) => this;
  declare setDepth: (value: number) => this;
  declare setScrollFactor: (x: number, y?: number) => this;
  declare setPosition: (x?: number, y?: number, z?: number, w?: number) => this;
  declare setVisible: (value: boolean) => this;
  declare setAlpha: (value: number) => this;

  private dim: Phaser.GameObjects.Rectangle;
  private hand: Phaser.GameObjects.Text;
  private mainText: Phaser.GameObjects.Text;
  private subText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setDepth(100);
    this.setScrollFactor(0);

    const { width, height } = scene.scale;

    // Dim Background
    this.dim = scene.add.rectangle(0, 0, width, height, 0x000000, 0.6);
    this.add(this.dim);

    // Hand Icon
    this.hand = scene.add.text(0, -60, '👆', {
        fontSize: '96px',
    }).setOrigin(0.5).setPadding(20); // Add padding to prevent clipping
    this.add(this.hand);

    // Text Instructions
    this.mainText = scene.add.text(0, 40, 'اضغط مطولاً', {
        fontFamily: 'Cairo',
        fontSize: '42px',
        fontStyle: 'bold',
        color: '#ffd700',
        stroke: '#000000',
        strokeThickness: 6,
        align: 'center'
    }).setOrigin(0.5);
    this.add(this.mainText);
    
    this.subText = scene.add.text(0, 90, 'للقفز فوق الصخرة', {
        fontFamily: 'Cairo',
        fontSize: '24px',
        color: '#ffffff',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 2
    }).setOrigin(0.5);
    this.add(this.subText);

    this.setPosition(width / 2, height / 2);

    // Pulse Animation
    this.scene.tweens.add({
        targets: this.hand,
        scale: { from: 1, to: 0.9 },
        alpha: { from: 1, to: 0.8 },
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });

    this.setVisible(false);
    this.setAlpha(0);
  }

  public show() {
      this.setVisible(true);
      this.scene.tweens.add({
          targets: this,
          alpha: 1,
          duration: 300
      });
  }

  public hide() {
      this.scene.tweens.add({
          targets: this,
          alpha: 0,
          duration: 200,
          onComplete: () => this.setVisible(false)
      });
  }

  public resize(width: number, height: number) {
      this.setPosition(width / 2, height / 2);
      this.dim.setSize(width, height);
  }
}