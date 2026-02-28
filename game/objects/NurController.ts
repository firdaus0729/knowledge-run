import Phaser from 'phaser';

export type NurState = 'greet' | 'encourage' | 'think' | 'warning' | 'success';

/**
 * Central controller for Nur's animated expressions.
 *
 * - Handles sprite / animation setup
 * - Provides simple show/hide API
 * - Keeps all Nur visuals inside Phaser (React only handles text)
 */
const NUR_IMAGE_KEYS: Record<NurState, string> = {
  greet: 'nur_img_greet',
  encourage: 'nur_img_encourage',
  think: 'nur_img_think',
  warning: 'nur_img_warning',
  success: 'nur_img_success'
};

/** Nur display size and gold ring (slightly smaller for a gentler look) */
const NUR_DISPLAY_SIZE = 128;
const NUR_BORDER_RADIUS = 70; // Slightly outside 128x128 (half = 64)
/** Gold circle center (vertical). Kept slightly above so circle frames from above. */
const NUR_CIRCLE_OFFSET_Y = 8;
/** Sprite center below circle so raised hand stays inside the circle */
const NUR_SPRITE_OFFSET_Y = 14;
const NUR_MESSAGE_OFFSET_Y = 78; // Below 128px image so text does not overlap
/** When position is 'top': place Nur so gap to speech bubble is ~5px. */
const NUR_TOP_Y_PX = 278;

export class NurController {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private sprite: Phaser.GameObjects.Sprite;
  private messageText: Phaser.GameObjects.Text | null = null;
  private secondaryMessageText: Phaser.GameObjects.Text | null = null;
  private goldBorder: Phaser.GameObjects.Graphics;

  private currentState: NurState | null = null;
  private floatTween: Phaser.Tweens.Tween | null = null;
  private breathTween: Phaser.Tweens.Tween | null = null;
  /** When true, use the 5 loaded PNGs; when false, use procedural sprite sheet */
  private useImageAssets: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.useImageAssets = this.scene.textures.exists(NUR_IMAGE_KEYS.greet);
    if (!this.useImageAssets) {
      this.ensureTexturesAndAnimations();
    }

    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(210);
    this.container.setVisible(false);
    this.container.setAlpha(0);

    // Soft circular glow behind Nur (scaled down to match smaller character)
    const glowKey = 'nur_glow';
    if (!this.scene.textures.exists(glowKey)) {
      const size = 320;
      const tex = this.scene.textures.createCanvas(glowKey, size, size);
      if (tex) {
        const ctx = tex.context;
        const cx = size / 2;
        const cy = size / 2;
        const grd = ctx.createRadialGradient(cx, cy, 30, cx, cy, size / 2);
        grd.addColorStop(0, 'rgba(255, 220, 140, 0.4)');
        grd.addColorStop(0.5, 'rgba(255, 200, 100, 0.2)');
        grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, size, size);
        tex.refresh();
      }
    }

    const glow = this.scene.add.image(0, 0, glowKey);
    glow.setDisplaySize(NUR_DISPLAY_SIZE + 40, NUR_DISPLAY_SIZE + 40);
    glow.setAlpha(0.92);

    if (this.useImageAssets) {
      this.sprite = this.scene.add.sprite(0, NUR_SPRITE_OFFSET_Y, NUR_IMAGE_KEYS.greet);
    } else {
      this.sprite = this.scene.add.sprite(0, NUR_SPRITE_OFFSET_Y, 'nur_sheet', 'nur_greet_0');
    }
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setDisplaySize(NUR_DISPLAY_SIZE, NUR_DISPLAY_SIZE);

    // Gold circular border around Nur (circle center separate so sprite can sit lower inside it)
    this.goldBorder = this.scene.add.graphics();
    this.goldBorder.lineStyle(4, 0xffd700, 1);
    this.goldBorder.strokeCircle(0, NUR_CIRCLE_OFFSET_Y, NUR_BORDER_RADIUS);
    this.goldBorder.lineStyle(2, 0xffec8b, 0.6);
    this.goldBorder.strokeCircle(0, NUR_CIRCLE_OFFSET_Y, NUR_BORDER_RADIUS - 2);

    this.container.add([glow, this.sprite, this.goldBorder]);
  }

  /**
   * Show Nur with the given expression.
   *
   * @param state     Logical expression (greet, encourage, think, warning, success)
   * @param options   Optional position, auto-hide duration, and message text below Nur
   */
  public show(
    state: NurState,
    options?: {
      position?: 'center' | 'top';
      duration?: number;
      message?: string;
      /** Secondary paragraph (e.g. intro); rendered smaller and less prominent below main message */
      secondaryMessage?: string;
    }
  ) {
    const { width, height } = this.scene.scale;
    const pos = options?.position || 'top';

    if (pos === 'center') {
      this.container.setPosition(width / 2, height / 2);
    } else {
      const y = Math.min(NUR_TOP_Y_PX, height - 90);
      this.container.setPosition(width / 2, y);
    }

    const wrapWidth = Math.min(width * 0.8, 420);

    if (this.messageText) {
      this.messageText.destroy();
      this.messageText = null;
    }
    if (this.secondaryMessageText) {
      this.secondaryMessageText.destroy();
      this.secondaryMessageText = null;
    }

    if (options?.message) {
      this.messageText = this.scene.add.text(0, NUR_MESSAGE_OFFSET_Y, options.message, {
        fontFamily: 'Cairo',
        fontSize: '22px',
        color: '#f5f0e8',
        align: 'center',
        lineSpacing: 8,
        wordWrap: { width: wrapWidth }
      }).setOrigin(0.5, 0);
      this.container.add(this.messageText);
    }

    if (options?.secondaryMessage) {
      const secondaryY = NUR_MESSAGE_OFFSET_Y + 32;
      this.secondaryMessageText = this.scene.add.text(0, secondaryY, options.secondaryMessage, {
        fontFamily: 'Cairo',
        fontSize: '17px',
        color: 'rgba(245, 240, 232, 0.72)',
        align: 'center',
        lineSpacing: 6,
        wordWrap: { width: wrapWidth }
      }).setOrigin(0.5, 0);
      this.container.add(this.secondaryMessageText);
    }

    // Update character display: image assets = set texture; procedural = play animation
    if (this.currentState !== state) {
      if (this.useImageAssets) {
        this.sprite.setTexture(NUR_IMAGE_KEYS[state]);
      } else if (this.scene.anims.exists(`nur_${state}`)) {
        this.sprite.play(`nur_${state}`);
      }
      this.currentState = state;
    }

    // Soft floating idle: subtle vertical movement only (smooth and lightweight)
    if (this.floatTween) {
      this.floatTween.stop();
      this.floatTween = null;
    }
    const floatAmplitude = 3;
    const floatDuration = 2800;
    this.floatTween = this.scene.tweens.add({
      targets: this.container,
      y: this.container.y - floatAmplitude,
      duration: floatDuration,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Optional very subtle breath on sprite (kept minimal for performance)
    if (this.breathTween) {
      this.breathTween.stop();
      this.breathTween = null;
    }
    const baseScaleX = this.sprite.scaleX;
    const baseScaleY = this.sprite.scaleY;
    const baseY = this.sprite.y;
    this.breathTween = this.scene.tweens.add({
      targets: this.sprite,
      scaleX: baseScaleX * 1.01,
      scaleY: baseScaleY * 0.99,
      y: baseY - 1,
      duration: floatDuration,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Fade in
    if (!this.container.visible) {
      this.container.setVisible(true);
      this.container.setAlpha(0);
    }
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 600,
      ease: 'Sine.easeOut'
    });

    if (options?.duration && options.duration > 0) {
      this.scene.time.delayedCall(options.duration, () => {
        if (this.currentState === state) {
          this.hide();
        }
      });
    }
  }

  /**
   * Hide Nur with a smooth fade-out.
   */
  public hide() {
    if (!this.container.visible || this.container.alpha === 0) return;

    if (this.floatTween) {
      this.floatTween.stop();
      this.floatTween = null;
    }
    if (this.breathTween) {
      this.breathTween.stop();
      this.breathTween = null;
    }
    if (this.messageText) {
      this.messageText.destroy();
      this.messageText = null;
    }
    if (this.secondaryMessageText) {
      this.secondaryMessageText.destroy();
      this.secondaryMessageText = null;
    }

    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 600,
      ease: 'Sine.easeIn',
      onComplete: () => {
        this.container.setVisible(false);
        this.currentState = null;
      }
    });
  }

  /**
   * Resize hook – keep Nur centered correctly on viewport changes.
   */
  public resize(width: number, height: number) {
    if (!this.container.visible) return;
    const isCenter = Math.abs(this.container.y - height / 2) < 10;
    if (isCenter) {
      this.container.setPosition(width / 2, height / 2);
    } else {
      const y = Math.min(NUR_TOP_Y_PX, height - 90);
      this.container.setPosition(width / 2, y);
    }
    if (this.messageText) {
      this.messageText.setWordWrapWidth(Math.min(width * 0.8, 420));
    }
    if (this.secondaryMessageText) {
      this.secondaryMessageText.setWordWrapWidth(Math.min(width * 0.8, 420));
    }
  }

  /**
   * Generate Nur's sprite sheet procedurally and define Phaser animations.
   *
   * This keeps assets lightweight and avoids external dependencies while still
   * providing multiple animated expressions.
   */
  private ensureTexturesAndAnimations() {
    const key = 'nur_sheet';
    if (!this.scene.textures.exists(key)) {
      const FRAME_W = 200;
      const FRAME_H = 200;
      const STATES: NurState[] = ['greet', 'encourage', 'think', 'warning', 'success'];
      const FRAMES_PER_STATE = 3;
      const COLS = FRAMES_PER_STATE;
      const ROWS = STATES.length;
      const tex = this.scene.textures.createCanvas(
        key,
        FRAME_W * COLS,
        FRAME_H * ROWS
      );
      if (tex) {
        const ctx = tex.context;

        const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
          const d = Math.min(r, w / 2, h / 2);
          ctx.moveTo(x + d, y);
          ctx.lineTo(x + w - d, y);
          ctx.quadraticCurveTo(x + w, y, x + w, y + d);
          ctx.lineTo(x + w, y + h - d);
          ctx.quadraticCurveTo(x + w, y + h, x + w - d, y + h);
          ctx.lineTo(x + d, y + h);
          ctx.quadraticCurveTo(x, y + h, x, y + h - d);
          ctx.lineTo(x, y + d);
          ctx.quadraticCurveTo(x, y, x + d, y);
        };

        const drawNurFrame = (state: NurState, frameIndex: number, col: number, row: number) => {
          const x0 = col * FRAME_W;
          const y0 = row * FRAME_H;
          const cx = x0 + FRAME_W / 2;
          const cy = y0 + FRAME_H / 2 + 8;

          ctx.save();
          ctx.translate(cx, cy);
          ctx.clearRect(-FRAME_W / 2, -FRAME_H / 2, FRAME_W, FRAME_H);

          const P = {
            SKIN: '#f5e6d3',
            SKIN_SHADOW: '#e8d4bc',
            ROBE: '#fafafa',
            ROBE_FOLD: '#eee',
            ROBE_D: '#e8e8e8',
            VEST: '#16a085',
            VEST_LIGHT: '#1abc9c',
            GOLD: '#e8c547',
            GOLD_BRIGHT: '#f4d03f',
            OUTLINE: 'rgba(0,0,0,0.12)'
          };

          const t = frameIndex / FRAMES_PER_STATE;
          let bob = Math.sin(t * Math.PI * 2) * 2.5;
          let lean = 0;
          if (state === 'greet') lean = 0.06;
          else if (state === 'encourage') lean = 0.08;
          else if (state === 'warning') lean = -0.04;
          else if (state === 'think') { lean = -0.08; bob *= 0.5; }
          else if (state === 'success') lean = 0.1;

          ctx.translate(0, bob);
          ctx.rotate(lean);

          // Robe body with soft shadow
          ctx.shadowColor = 'rgba(0,0,0,0.15)';
          ctx.shadowBlur = 6;
          ctx.shadowOffsetY = 2;
          ctx.fillStyle = P.ROBE;
          ctx.beginPath();
          ctx.moveTo(-22, 12);
          ctx.lineTo(22, 12);
          ctx.lineTo(26, 48);
          ctx.quadraticCurveTo(0, 62, -26, 48);
          ctx.closePath();
          ctx.fill();
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetY = 0;

          ctx.strokeStyle = P.OUTLINE;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Vest (clean trapezoid)
          const grad = ctx.createLinearGradient(-18, -8, 18, 14);
          grad.addColorStop(0, P.VEST_LIGHT);
          grad.addColorStop(1, P.VEST);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(-18, -4);
          ctx.lineTo(18, -4);
          ctx.lineTo(18, 14);
          ctx.lineTo(-18, 14);
          ctx.closePath();
          ctx.fill();

          // Belt
          const beltGrad = ctx.createLinearGradient(-14, 12, 14, 16);
          beltGrad.addColorStop(0, P.GOLD_BRIGHT);
          beltGrad.addColorStop(0.5, P.GOLD);
          beltGrad.addColorStop(1, P.GOLD_BRIGHT);
          ctx.fillStyle = beltGrad;
          ctx.fillRect(-14, 12, 28, 5);

          // Head
          ctx.save();
          ctx.translate(0, -24);
          ctx.fillStyle = P.SKIN_SHADOW;
          ctx.beginPath();
          ctx.ellipse(0, 2, 13, 15, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = P.SKIN;
          ctx.beginPath();
          ctx.ellipse(0, 0, 13, 15, 0, 0, Math.PI * 2);
          ctx.fill();

          // Turban (wrapped cloth)
          ctx.fillStyle = P.ROBE_D;
          ctx.beginPath();
          ctx.ellipse(0, -8, 16, 8, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = P.ROBE_FOLD;
          ctx.beginPath();
          ctx.arc(0, -6, 14, Math.PI * 0.6, Math.PI * 0.4);
          ctx.stroke();

          // Eyes
          ctx.fillStyle = '#3d3d3d';
          let eyeDx = 4.5;
          let eyeScale = 1;
          if (state === 'think') { eyeDx = 3.8; eyeScale = 0.9; }
          if (state === 'warning') { eyeDx = 4; eyeScale = 1.1; }
          ctx.beginPath();
          ctx.ellipse(-eyeDx, 0, 1.5 * eyeScale, 1.8 * eyeScale, 0, 0, Math.PI * 2);
          ctx.ellipse(eyeDx, 0, 1.5 * eyeScale, 1.8 * eyeScale, 0, 0, Math.PI * 2);
          ctx.fill();

          // Mouth
          ctx.strokeStyle = '#4a4a4a';
          ctx.lineWidth = 1.6;
          ctx.lineCap = 'round';
          ctx.beginPath();
          if (state === 'greet' || state === 'encourage' || state === 'success') {
            ctx.arc(0, 5, 5, 0.15 * Math.PI, 0.85 * Math.PI);
          } else if (state === 'think') {
            ctx.moveTo(-3.5, 6);
            ctx.lineTo(3.5, 6);
          } else {
            ctx.arc(0, 8, 3.5, Math.PI, 0, true);
          }
          ctx.stroke();

          ctx.restore();

          const drawArm = (side: 'left' | 'right', pose: 'wave' | 'thumb' | 'chin' | 'alert' | 'open') => {
            ctx.save();
            const dir = side === 'left' ? -1 : 1;
            ctx.translate(dir * 16, -10);

            let upperAngle = 0, lowerAngle = 0;
            if (pose === 'wave') {
              upperAngle = -0.55 * dir;
              lowerAngle = (-0.08 + 0.18 * Math.sin(t * Math.PI * 2)) * dir;
            } else if (pose === 'thumb') {
              upperAngle = -0.85 * dir;
              lowerAngle = -0.15 * dir;
            } else if (pose === 'chin') {
              upperAngle = -0.35 * dir;
              lowerAngle = 0.55 * dir;
            } else if (pose === 'alert') {
              upperAngle = -0.28 * dir;
              lowerAngle = 0.08 * dir;
            } else {
              upperAngle = -0.28 * dir;
              lowerAngle = 0;
            }

            ctx.rotate(upperAngle);
            ctx.scale(dir, 1);
            ctx.fillStyle = P.ROBE_D;
            ctx.beginPath();
            roundRect(-3.5, 0, 7, 16, 4);
            ctx.fill();
            ctx.scale(dir, 1);

            ctx.translate(0, 14);
            ctx.rotate(lowerAngle);
            ctx.scale(dir, 1);
            ctx.fillStyle = P.ROBE;
            ctx.beginPath();
            roundRect(-2.5, 0, 5, 12, 3);
            ctx.fill();
            ctx.scale(dir, 1);

            ctx.translate(0, 11);
            ctx.fillStyle = P.SKIN;
            if (pose === 'thumb') {
              ctx.beginPath();
              ctx.moveTo(-3.5 * dir, 2);
              ctx.lineTo(-1 * dir, -5);
              ctx.lineTo(1 * dir, -5);
              ctx.lineTo(3.5 * dir, 2);
              ctx.closePath();
              ctx.fill();
            } else {
              ctx.beginPath();
              ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();
          };

          if (state === 'greet') drawArm('right', 'wave');
          else if (state === 'encourage') drawArm('right', 'thumb');
          else if (state === 'think') drawArm('right', 'chin');
          else if (state === 'warning') drawArm('right', 'alert');
          else {
            drawArm('left', 'open');
            drawArm('right', 'open');
          }

          ctx.restore();
        };

        STATES.forEach((state, row) => {
          for (let frame = 0; frame < FRAMES_PER_STATE; frame++) {
            drawNurFrame(state, frame, frame, row);
          }
        });

        tex.refresh();

        STATES.forEach((state, row) => {
          for (let frame = 0; frame < FRAMES_PER_STATE; frame++) {
            const x = frame * FRAME_W;
            const y = row * FRAME_H;
            tex.add(`nur_${state}_${frame}`, 0, x, y, FRAME_W, FRAME_H);
          }
        });
      }
    }

    // Define animations once
    const defineAnim = (state: NurState, frameRate: number = 8) => {
      const keyAnim = `nur_${state}`;
      if (this.scene.anims.exists(keyAnim)) return;
      const frames = [0, 1, 2].map((i) => ({
        key: 'nur_sheet',
        frame: `nur_${state}_${i}`
      }));
      this.scene.anims.create({
        key: keyAnim,
        frames,
        frameRate,
        repeat: -1
      });
    };

    defineAnim('greet', 9);
    defineAnim('encourage', 9);
    defineAnim('think', 6);
    defineAnim('warning', 9);
    defineAnim('success', 10);
  }
}

