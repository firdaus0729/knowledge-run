
import Phaser from 'phaser';
import { PHYSICS } from '../../constants';

export class Player extends Phaser.Physics.Arcade.Sprite {
  // ... (Keep existing declarations) ...
  declare body: Phaser.Physics.Arcade.Body;
  declare scene: Phaser.Scene;
  declare x: number;
  declare y: number;
  declare anims: Phaser.Animations.AnimationState;
  declare setTint: (color?: number) => this;
  declare clearTint: () => this;
  declare setDepth: (value: number) => this;
  declare setGravityY: (value: number) => this;
  declare setVelocityY: (value: number) => this;
  declare setVelocityX: (value: number) => this;
  declare setVelocity: (x: number, y?: number) => this;
  declare setAccelerationY: (value: number) => this; // New
  declare setScale: (x: number, y?: number) => this;
  declare setOrigin: (x: number, y: number) => this;
  declare scaleX: number;
  declare scaleY: number;
  declare frame: Phaser.Textures.Frame;
  declare rotation: number;
  declare angle: number; // Added this
  declare alpha: number;
  declare play: (key: string | Phaser.Animations.Animation, ignoreIfPlaying?: boolean) => this;
  declare setCollideWorldBounds: (value: boolean) => this;
  declare setAngle: (degrees: number) => this;
  declare setPosition: (x?: number, y?: number, z?: number, w?: number) => this;
  declare setRotation: (radians?: number) => this;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private jumpKey!: Phaser.Input.Keyboard.Key;
  
  private jumpBuffer: number = 0;
  private coyoteTime: number = 0;
  private isJumping: boolean = false;
  private isInvulnerable: boolean = false;
  
  // Event States
  public isHanging: boolean = false;
  public isClimbing: boolean = false;
  public isReaching: boolean = false; 
  public isStruggling: boolean = false; 
  public isScripted: boolean = false;
  public isFlying: boolean = false; 
  
  private carpetSprite!: Phaser.GameObjects.Sprite; 

  // Jump Mechanics
  private canVariableJump: boolean = false; 

  // Shield Logic
  private isShielded: boolean = false;
  private shieldTimer: number = 0;
  private shieldAura!: Phaser.GameObjects.Sprite;
  
  // Input State
  private isHoldingJump: boolean = false;
  private wasHoldingJump: boolean = false; 

  // Juice
  private dustEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private ghostTimer: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    if (!scene.textures.exists('playerSheet')) {
        Player.generateTexture(scene);
    }
    super(scene, x, y, 'playerSheet');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setDepth(20);
    this.setGravityY(PHYSICS.GRAVITY);
    
    if (this.body) {
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setSize(30, 75);
        body.setOffset(48, 28); 
    }

    this.initAnimations();
    this.initParticles();
    this.initShieldAura();
    this.setupInputs();
    
    // Create Carpet Sprite (Hidden by default)
    this.carpetSprite = scene.add.sprite(0, 0, 'magic_carpet_pickup');
    this.carpetSprite.setVisible(false);
    this.carpetSprite.setDepth(19); // Under player
    
    if (this.scene.anims.exists('run')) {
        this.play('run');
    }
  }

  public setVariableJump(enabled: boolean) {
      this.canVariableJump = enabled;
  }

  // --- FLYING METHODS ---
  public startFlying() {
      if (this.isFlying) return;
      this.isFlying = true;
      
      this.body.setAllowGravity(false);
      this.setVelocityY(0);
      this.setAccelerationY(0);
      
      // Add Drag for inertia feel
      this.body.setDragY(300);
      // Cap velocity so we don't go supersonic
      this.body.setMaxVelocity(1000, 400);
      
      // Visual change
      this.play('jump'); // Static pose
      this.setAngle(15); 
      
      this.carpetSprite.setVisible(true);
      
      // Initial boost up
      this.setVelocityY(-300);
  }

  public stopFlying() {
      if (!this.isFlying) return;
      this.isFlying = false;
      
      this.body.setAllowGravity(true);
      this.setAccelerationY(0);
      this.body.setDragY(0);
      this.body.setMaxVelocity(10000, 10000); // Reset limits
      this.setAngle(0);
      this.carpetSprite.setVisible(false);
      this.play('run');
  }

  // ... (Keep existing methods: startStruggle, stopStruggle, getHangPosition, startHanging, lockLedgeGrab, climbUp, bounce, initShieldAura, setupInputs, initAnimations, initParticles) ...
  public startStruggle() {
      this.isStruggling = true;
      this.play('struggle');
  }

  public stopStruggle() {
      this.isStruggling = false;
      this.setRotation(0); 
      this.play('run');
  }

  public getHangPosition(ledgeX: number, ledgeY: number): { x: number, y: number } {
      return { x: ledgeX - 15, y: ledgeY + 50 };
  }

  public startHanging(ledgeX: number, ledgeY: number) {
      if (this.isHanging) return;
      this.isHanging = true;
      this.isJumping = false;
      this.isReaching = false;
      this.isFlying = false; // Just in case

      const forwardVelocity = this.body.velocity.x;
      
      this.body.setAllowGravity(false);
      this.setVelocity(0, 0);
      const hangPos = this.getHangPosition(ledgeX, ledgeY);
      this.setPosition(hangPos.x, hangPos.y);
      this.setDepth(25);
      
      this.lockLedgeGrab(forwardVelocity);
  }

  private lockLedgeGrab(initialVelocity: number) {
      this.play('hang');
      this.setOrigin(0.5, 0.5); 
      this.setRotation(0);

      this.scene.tweens.add({
          targets: this,
          scaleY: 1.0,
          scaleX: 1.0,
          duration: 200,
          ease: 'Sine.out'
      });

      const swingIntensity = Phaser.Math.Clamp(Math.abs(initialVelocity) / 10, 15, 35);
      this.scene.tweens.add({
          targets: this,
          angle: { from: swingIntensity, to: 0 }, 
          duration: 800, 
          ease: 'Elastic.out',
          easeParams: [1.2, 0.8],
          onComplete: () => {
              this.scene.tweens.add({
                  targets: this,
                  angle: { from: 2, to: -2 },
                  duration: 2000,
                  yoyo: true,
                  repeat: -1,
                  ease: 'Sine.easeInOut'
              });
          }
      });
  }

  public climbUp(targetY: number, onComplete: () => void) {
      if (this.isClimbing) return;
      this.isClimbing = true;
      this.isHanging = false;
      
      this.scene.tweens.killTweensOf(this);
      this.setAngle(0);
      this.play('climb');
      
      const standX = this.x + 50; 
      const standY = targetY - 64;

      this.scene.tweens.add({
          targets: this,
          x: standX,
          y: standY,
          duration: 600,
          ease: 'Cubic.out',
          onComplete: () => {
              this.isClimbing = false;
              this.body.setAllowGravity(true);
              this.setDepth(20); 
              this.play('run');
              onComplete();
          }
      });
  }

  public bounce(force: number) {
      this.setVelocityY(-force);
      this.isJumping = true;
      this.isReaching = false;
      if (this.scene.anims.exists('jump')) this.play('jump', true);
      this.scene.tweens.add({
          targets: this,
          scaleX: 0.8, scaleY: 1.2, duration: 150, yoyo: true, ease: 'Sine.easeOut'
      });
      this.coyoteTime = 0;
  }

  private initShieldAura() {
      if (!this.scene.textures.exists('shield_aura')) {
          const size = 128;
          const canvas = this.scene.textures.createCanvas('shield_aura', size, size);
          if (canvas) {
              const ctx = canvas.context;
              const cx = size / 2;
              const cy = size / 2;
              const radius = 55;
              ctx.clearRect(0,0,size,size);
              ctx.strokeStyle = '#00f2ff'; 
              ctx.lineWidth = 2;
              ctx.setLineDash([10, 8]); 
              ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.stroke();
              ctx.setLineDash([]); 
              ctx.lineWidth = 1;
              ctx.strokeStyle = 'rgba(0, 242, 255, 0.6)';
              ctx.beginPath();
              for (let i = 0; i < 6; i++) {
                  const angle = (Math.PI / 3) * i;
                  const x = cx + Math.cos(angle) * (radius - 10);
                  const y = cy + Math.sin(angle) * (radius - 10);
                  if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
              }
              ctx.closePath(); ctx.stroke();
              ctx.beginPath();
              for (let i = 0; i < 6; i++) {
                  const angle = (Math.PI / 3) * i;
                  const x = cx + Math.cos(angle) * (radius - 10);
                  const y = cy + Math.sin(angle) * (radius - 10);
                  ctx.moveTo(cx, cy); ctx.lineTo(x, y);
              }
              ctx.stroke();
              ctx.fillStyle = 'rgba(0, 242, 255, 0.1)';
              ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fill();
              canvas.refresh();
          }
      }
      
      this.shieldAura = this.scene.add.sprite(this.x, this.y, 'shield_aura');
      this.shieldAura.setDepth(21);
      this.shieldAura.setVisible(false);
      this.shieldAura.setBlendMode(Phaser.BlendModes.ADD);
      
      this.scene.tweens.add({
          targets: this.shieldAura,
          angle: 360, duration: 6000, repeat: -1, ease: 'Linear'
      });
      
      this.scene.tweens.add({
          targets: this.shieldAura,
          scale: { from: 1, to: 1.05 }, alpha: { from: 1, to: 0.8 },
          duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      });
  }

  private setupInputs() {
    if (this.scene.input.keyboard) {
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.jumpKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }
    this.scene.input.on('pointerdown', () => { this.isHoldingJump = true; });
    this.scene.input.on('pointerup', () => { this.isHoldingJump = false; });
  }

  private initAnimations() {
      if (!this.scene.textures.exists('playerSheet')) return;
      if (!this.scene.anims.exists('run')) {
          this.scene.anims.create({ key: 'run', frames: this.scene.anims.generateFrameNumbers('playerSheet', { start: 0, end: 15 }), frameRate: 24, repeat: -1 });
      }
      if (!this.scene.anims.exists('jump')) {
          this.scene.anims.create({ key: 'jump', frames: this.scene.anims.generateFrameNumbers('playerSheet', { start: 16, end: 16 }), frameRate: 1 });
      }
      if (!this.scene.anims.exists('hang')) {
          this.scene.anims.create({ key: 'hang', frames: this.scene.anims.generateFrameNumbers('playerSheet', { start: 17, end: 17 }), frameRate: 1 });
      }
      if (!this.scene.anims.exists('climb')) {
          this.scene.anims.create({ key: 'climb', frames: this.scene.anims.generateFrameNumbers('playerSheet', { start: 18, end: 18 }), frameRate: 1 });
      }
      if (!this.scene.anims.exists('fall')) {
          this.scene.anims.create({ key: 'fall', frames: this.scene.anims.generateFrameNumbers('playerSheet', { start: 19, end: 19 }), frameRate: 1 });
      }
      if (!this.scene.anims.exists('struggle')) {
          this.scene.anims.create({ key: 'struggle', frames: this.scene.anims.generateFrameNumbers('playerSheet', { start: 20, end: 35 }), frameRate: 16, repeat: -1 });
      }
  }

  private initParticles() {
      if (!this.scene.textures.exists('dust_particle')) {
          const canvas = this.scene.textures.createCanvas('dust_particle', 8, 8);
          if (canvas) {
              const ctx = canvas.context;
              ctx.fillStyle = '#eaddcf';
              ctx.beginPath(); ctx.arc(4, 4, 4, 0, Math.PI*2); ctx.fill();
              canvas.refresh();
          }
      }
      this.dustEmitter = this.scene.add.particles(0, 0, 'dust_particle', {
          lifespan: 400, speedX: { min: -100, max: -50 }, speedY: { min: -50, max: 0 },
          scale: { start: 0.8, end: 0 }, alpha: { start: 0.5, end: 0 },
          quantity: 1, frequency: 100, emitting: false
      });
      this.dustEmitter.setDepth(19);
  }

  update(time: number, delta: number) {
    if (!this.body) return;
    const body = this.body as Phaser.Physics.Arcade.Body;
    
    // --- SPECIAL STATE: FLYING (SMOOTH INERTIA) ---
    if (this.isFlying) {
        // Sync Carpet
        this.carpetSprite.setPosition(this.x, this.y + 30);
        
        // Tilt based on vertical velocity
        const vy = body.velocity.y;
        const targetAngle = Phaser.Math.Clamp(vy * 0.05, -15, 25);
        this.angle = Phaser.Math.Linear(this.angle, targetAngle, 0.1); // Smooth rotation
        this.carpetSprite.setRotation(this.rotation);
        
        // Input Logic (Jetpack Momentum)
        const isHeld = (this.jumpKey?.isDown) || (this.cursors?.up.isDown) || this.isHoldingJump;
        
        if (isHeld) {
            // Accelerate UP
            this.setAccelerationY(-900); 
        } else {
            // Fall slowly (Gravity/Drift)
            this.setAccelerationY(500); 
        }
        
        // Soft Bounds (Bounce off edges smoothly)
        if (this.y < 50) {
            this.y = 50;
            if(body.velocity.y < 0) this.setVelocityY(0);
        }
        if (this.y > this.scene.scale.height - 100) {
            this.y = this.scene.scale.height - 100;
            if(body.velocity.y > 0) this.setVelocityY(0);
        }
        
        // Shield Sync
        if (this.isShielded) {
            this.shieldTimer -= delta;
            this.shieldAura.setPosition(this.x, this.y);
            this.shieldAura.setVisible(true);
            if (this.shieldTimer <= 0) {
                this.isShielded = false;
                this.shieldAura.setVisible(false);
            }
        }
        
        return; // Skip normal platformer logic
    }

    // --- NORMAL LOGIC ---
    if (this.isHanging || this.isClimbing || this.isScripted) return; 

    const onGround = body.blocked.down || body.touching.down;
    const isTweening = this.scene.tweens.isTweening(this);
    
    if (this.isStruggling && onGround && !isTweening) {
        const wobble = Math.sin(time * 0.015); 
        const jitter = (Math.random() - 0.5) * 0.05; 
        this.setRotation(0.05 + (wobble * 0.05) + jitter);
        const stepPush = Math.sin(time * 0.02) * 2; 
        this.x = 100 + stepPush; 
    } else {
        if (Math.abs(this.x - 100) > 1 && !this.isJumping && !isTweening) {
            this.x = Phaser.Math.Linear(this.x, 100, 0.1);
        }
    }

    if (this.isShielded) {
        this.shieldTimer -= delta;
        this.shieldAura.setPosition(this.x, this.y);
        if (this.shieldTimer < 3000) {
            this.shieldAura.setVisible(Math.floor(time / 100) % 2 === 0);
        } else {
            this.shieldAura.setVisible(true);
        }
        if (this.shieldTimer <= 0) {
            this.isShielded = false;
            this.shieldAura.setVisible(false);
        }
    }

    const isJumpKeyHeld = (this.jumpKey?.isDown) || (this.cursors?.up.isDown) || this.isHoldingJump;
    const justPressedKey = Phaser.Input.Keyboard.JustDown(this.jumpKey) || Phaser.Input.Keyboard.JustDown(this.cursors.up);
    const justPressedTouch = this.isHoldingJump && !this.wasHoldingJump;
    const wantsToJump = justPressedKey || justPressedTouch;

    if (wantsToJump) {
        this.jumpBuffer = time + PHYSICS.BUFFER_TIME;
    }

    if (onGround) {
        this.isJumping = false;
        this.isReaching = false;
        this.coyoteTime = time + PHYSICS.COYOTE_TIME;
    }

    if (time < this.coyoteTime && time < this.jumpBuffer && !this.isJumping) {
        if (!this.isStruggling && !isTweening) {
            this.executeJump();
        }
    }

    if (this.canVariableJump) {
        if (body.velocity.y < -300 && !isJumpKeyHeld) {
            this.setVelocityY(-300);
        }
    }

    if (onGround && Math.abs(body.velocity.x) > 10 && !isTweening) {
        this.dustEmitter.setPosition(this.x - 10, this.y + 40);
        if (!this.dustEmitter.emitting) this.dustEmitter.start();
    } else {
        this.dustEmitter.stop();
    }

    if (this.isJumping || !onGround) {
        if (body.velocity.y < 0) {
             if (this.anims.currentAnim?.key !== 'jump' && this.scene.anims.exists('jump')) this.play('jump', true);
        } else {
             if (this.isReaching) {
                 if (this.anims.currentAnim?.key !== 'fall' && this.scene.anims.exists('fall')) this.play('fall', true);
             } else {
                 if (this.anims.currentAnim?.key !== 'jump' && this.scene.anims.exists('jump')) this.play('jump', true);
             }
        }
        this.ghostTimer += delta;
        if (this.ghostTimer > 80) { 
            this.createGhost();
            this.ghostTimer = 0;
        }
    } else {
        if (this.isStruggling) {
            if (this.anims.currentAnim?.key !== 'struggle') this.play('struggle', true);
        } else {
            if (this.anims.currentAnim?.key !== 'run' && this.scene.anims.exists('run')) {
                 this.play('run', true);
                 this.setRotation(0); 
            }
        }
        
        if (!isTweening && !this.isStruggling) {
            this.setScale(Phaser.Math.Linear(this.scaleX, 1, 0.1), Phaser.Math.Linear(this.scaleY, 1, 0.1));
        }
    }

    this.wasHoldingJump = this.isHoldingJump;
  }

  public activateShield(duration: number = 10000) {
      this.isShielded = true;
      this.shieldTimer = duration;
      this.shieldAura.setVisible(true);
  }

  private executeJump() {
    this.setVelocityY(PHYSICS.JUMP_FORCE);
    this.isJumping = true;
    this.coyoteTime = 0;
    this.jumpBuffer = 0;
    if (this.scene.anims.exists('jump')) this.play('jump', true);
    this.dustEmitter.setPosition(this.x, this.y + 35);
    this.dustEmitter.explode(8);
    this.scene.tweens.add({ targets: this, scaleX: 0.9, scaleY: 1.1, duration: 200, yoyo: true, ease: 'Sine.easeOut' });
  }

  private createGhost() {
      if (!this.scene.textures.exists('playerSheet')) return;
      const ghost = this.scene.add.sprite(this.x, this.y, 'playerSheet');
      ghost.setFrame(this.frame.name);
      ghost.setAlpha(0.4);
      ghost.setTint(0xadd8e6);
      ghost.setDepth(18);
      ghost.setRotation(this.rotation);
      ghost.setScale(this.scaleX, this.scaleY);
      this.scene.tweens.add({ targets: ghost, alpha: 0, x: this.x - 30, duration: 300, onComplete: () => ghost.destroy() });
  }

  public takeDamage(onComplete: () => void): boolean {
      if (this.isInvulnerable || this.isShielded) return false;
      this.isInvulnerable = true;
      this.setTint(0xff4d4d);
      this.scene.tweens.add({ targets: this, x: this.x - 20, duration: 100, yoyo: true });
      this.scene.tweens.add({
          targets: this, alpha: 0.2, duration: 100, yoyo: true, repeat: 5,
          onComplete: () => {
              this.isInvulnerable = false;
              this.clearTint();
              this.alpha = 1;
              onComplete();
          }
      });
      return true;
  }
  
  static generateTexture(scene: Phaser.Scene) {
      if (scene.textures.exists('playerSheet')) return;
      // ... (Texture generation logic remains same) ...
      const FW = 128, FH = 128;
      const RUN_FRAMES = 16;
      const TOTAL_FRAMES = 36; 
      const COLS = 5;
      const ROWS = 8; 
      const texture = scene.textures.createCanvas('playerSheet', FW * COLS, FH * ROWS);
      if (!texture) return;
      const ctx = texture.context;
      const P = { SKIN: '#ffdfc4', SKIN_D: '#e0b090', ROBE_L: '#ffffff', ROBE_D: '#e2e2e2', VEST: '#1abc9c', VEST_D: '#16a085', SASH: '#ff4757', GOLD: '#ffd700', SHOES: '#2f3542' };
      
      const drawFrame = (index: number, type: 'run' | 'jump' | 'hang' | 'climb' | 'fall' | 'struggle') => {
        const col = index % COLS;
        const row = Math.floor(index / COLS);
        const cx = col * FW + FW / 2;
        const cy = row * FH + FH / 2 + 15;
        
        ctx.save(); ctx.translate(cx, cy);
        
        let jumpBob = 0; let lean = 0.15; let rLegA = 0, lLegA = 0, rArmA = 0, lArmA = 0; let scarfY = 0;

        if (type === 'run') {
            const t = (index / RUN_FRAMES) % 1;
            const cycle = t * Math.PI * 2;
            jumpBob = Math.sin(cycle * 2) * 3;
            lean = 0.15;
            rLegA = Math.cos(cycle) * 1.0;
            lLegA = Math.cos(cycle + Math.PI) * 1.0;
            rArmA = Math.cos(cycle + Math.PI) * 0.9;
            lArmA = Math.cos(cycle) * 0.9;
        } else if (type === 'jump') {
            jumpBob = -15; lean = 0.25;
            rLegA = -0.8; lLegA = 0.8;
            rArmA = -2.0; lArmA = -0.5;
            scarfY = -20;
        } else if (type === 'fall') {
            jumpBob = -5; lean = 0.1;   
            rLegA = 0.3; lLegA = 0.6;
            rArmA = -2.6; lArmA = -2.6; 
            scarfY = -30;
        } else if (type === 'hang') {
            jumpBob = 5; lean = 0.1;
            rLegA = 0.2; lLegA = 0.4;
            rArmA = -2.8; lArmA = -2.8; 
            scarfY = 0;
        } else if (type === 'climb') {
            jumpBob = -5; lean = 0.3; 
            rLegA = -1.5; lLegA = 0.5; 
            rArmA = 1.0; lArmA = 0.5;
            scarfY = -10;
        } else if (type === 'struggle') {
            const frameCycle = 16;
            const t = (index - 20) / frameCycle; 
            const cycle = t * Math.PI * 2;
            jumpBob = Math.sin(cycle * 2) * 1.5 + 1; 
            lean = 0.1; 
            rLegA = Math.cos(cycle) * 0.6; 
            lLegA = Math.cos(cycle + Math.PI) * 0.6;
            lArmA = -2.2 + Math.sin(cycle * 4) * 0.02; 
            rArmA = 0.4 + Math.cos(cycle) * 0.2;
            scarfY = -5;
        }
        
        ctx.translate(0, jumpBob);
        ctx.rotate(lean);
        
        let scarfWave = 0;
        let scarfRot = -0.2;
        
        if (type === 'run') {
            scarfWave = Math.sin((index/16)*Math.PI*2 * 2 - 1) * 8;
        } else if (type === 'struggle') {
            scarfWave = Math.sin(index * 1.8) * 12 + Math.cos(index * 2.5) * 5;
            scarfRot = -1.3; 
        } else if (type === 'hang' || type === 'fall') {
            scarfRot = -1.5;
        }

        ctx.save();
        ctx.translate(-8, -35 + scarfY);
        ctx.rotate(scarfRot); 
        ctx.fillStyle = P.SASH;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-20, 5 + scarfWave, -50, -10 + scarfWave);
        ctx.lineTo(-55, 5 + scarfWave);
        ctx.quadraticCurveTo(-20, 20 + scarfWave, 0, 10);
        ctx.fill();
        ctx.restore();

        const drawLimb = (angle: number, isArm: boolean, isRight: boolean) => {
            ctx.save();
            if (isArm) ctx.translate(0, -28);
            else ctx.translate(0, -5);

            ctx.rotate(angle);

            if (isArm) {
                ctx.fillStyle = isRight ? P.ROBE_L : P.ROBE_D;
                ctx.beginPath(); ctx.ellipse(0, 8, 6, 10, 0, 0, Math.PI*2); ctx.fill();
                ctx.translate(0, 16);
                
                let armBend = 0.5;
                if (type === 'struggle' && !isRight) armBend = 2.2; 
                
                const isStraight = (type === 'hang' || type === 'fall');
                ctx.rotate(isStraight ? 0 : armBend); 
                
                ctx.fillStyle = P.SKIN;
                ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI*2); ctx.fill();
            } else {
                ctx.fillStyle = isRight ? P.VEST : P.VEST_D;
                if (ctx.roundRect) {
                     ctx.beginPath(); ctx.roundRect(-5, 0, 10, 16, 4); ctx.fill();
                } else {
                     ctx.fillRect(-5, 0, 10, 16);
                }
                
                ctx.translate(0, 14);
                ctx.rotate(isRight ? -0.2 : 0.4);
                ctx.fillStyle = P.SKIN; 
                ctx.fillRect(-3, 0, 6, 8);
                ctx.translate(0, 8);
                ctx.fillStyle = P.SHOES;
                ctx.beginPath(); 
                ctx.moveTo(-4, 0); ctx.lineTo(4, 0); 
                ctx.lineTo(6, 6);
                ctx.lineTo(-4, 6); ctx.fill();
                ctx.fillStyle = P.GOLD;
                ctx.beginPath(); ctx.arc(2, 2, 2, 0, Math.PI*2); ctx.fill();
            }
            ctx.restore();
        };

        drawLimb(lLegA, false, false);
        if (type === 'struggle') drawLimb(rArmA, true, true); 
        else drawLimb(lArmA, true, false);

        ctx.save();
        ctx.translate(0, -20);
        ctx.fillStyle = P.ROBE_L;
        ctx.beginPath();
        if (type === 'struggle') {
             ctx.moveTo(-9, -15); ctx.lineTo(9, -15);
             ctx.lineTo(12, 15);
             ctx.quadraticCurveTo(0, 20, -12, 15);
        } else {
             ctx.moveTo(-9, -15); ctx.lineTo(9, -15);
             ctx.lineTo(12, 15);
             ctx.quadraticCurveTo(0, 20, -12, 15);
        }
        ctx.fill();
        
        ctx.fillStyle = P.VEST;
        ctx.beginPath();
        ctx.moveTo(-9, -15); ctx.lineTo(9, -15);
        ctx.lineTo(9, 0); ctx.lineTo(-9, 0);
        ctx.fill();
        
        ctx.fillStyle = P.SASH;
        ctx.fillRect(-10, 0, 20, 6);
        ctx.fillStyle = P.GOLD;
        ctx.fillRect(-3, 1, 6, 4);
        ctx.restore();

        ctx.save();
        const headY = type === 'struggle' ? -38 : -40; 
        const headX = type === 'struggle' ? 3 : 3;
        ctx.translate(headX, headY); 
        
        if (type === 'hang' || type === 'fall') ctx.rotate(-0.5); 
        else if (type === 'struggle') ctx.rotate(0.1);
        else ctx.rotate(-lean * 0.8);
        
        ctx.fillStyle = P.SKIN;
        ctx.beginPath(); ctx.ellipse(0, 0, 10, 11, 0, 0, Math.PI*2); ctx.fill();
        
        ctx.fillStyle = P.ROBE_L;
        ctx.beginPath(); ctx.arc(0, -6, 11, Math.PI, 0); ctx.fill();
        
        if (ctx.roundRect) {
             ctx.beginPath(); ctx.roundRect(-12, -6, 24, 8, 4); ctx.fill();
        } else {
             ctx.fillRect(-12, -6, 24, 8);
        }
        
        ctx.fillStyle = P.VEST;
        ctx.beginPath(); ctx.arc(0, -6, 3, 0, Math.PI*2); ctx.fill();
        
        ctx.fillStyle = '#2c3e50';
        if (type === 'hang' || type === 'fall') {
             ctx.beginPath(); ctx.arc(5, -1, 1.5, 0, Math.PI*2); ctx.fill();
        } else if (type === 'struggle') {
             ctx.fillRect(3, 1, 4, 1);
        } else {
             ctx.beginPath(); ctx.arc(4, 1, 1.5, 0, Math.PI*2); ctx.fill();
        }
        
        ctx.restore();

        drawLimb(rLegA, false, true);
        if (type === 'struggle') drawLimb(lArmA, true, false);
        else drawLimb(rArmA, true, true);

        ctx.restore();
      };
      
      for (let i = 0; i < RUN_FRAMES; i++) drawFrame(i, 'run');
      drawFrame(16, 'jump');
      drawFrame(17, 'hang');
      drawFrame(18, 'climb');
      drawFrame(19, 'fall');
      for (let i = 20; i < 36; i++) drawFrame(i, 'struggle');
      
      texture.refresh();
      
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        texture.add(i, 0, col * FW, row * FH, FW, FH);
      }
  }
}
