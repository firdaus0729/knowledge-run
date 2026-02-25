
import Phaser from 'phaser';
import { PHYSICS } from '../../constants';
import { Player } from '../objects/Player';
import { Obstacle } from '../objects/Obstacle';
import { Question, GameState, NoorMessage, StageResultsData } from '../../types';
import { getQuestions } from '../data/questions';

// Objects for Texture Generation
import { Star } from '../objects/Star';
import { Heart } from '../objects/Heart';
import { ShieldItem } from '../objects/ShieldItem';
import { MerchantCart } from '../objects/MerchantCart';
import { StackOfRugs } from '../objects/StackOfRugs';
import { MagicCarpet } from '../objects/MagicCarpet'; 
import { StreetCat } from '../objects/StreetCat'; // Import Cat

// Managers
import { EnvironmentManager } from '../managers/EnvironmentManager';
import { SpawnManager } from '../managers/SpawnManager';
import { EventManager } from '../managers/EventManager';
import { CollisionManager } from '../managers/CollisionManager';

export class MainScene extends Phaser.Scene {
  declare scale: Phaser.Scale.ScaleManager;
  declare add: Phaser.GameObjects.GameObjectFactory;
  declare physics: Phaser.Physics.Arcade.ArcadePhysics;
  declare input: Phaser.Input.InputPlugin;
  declare tweens: Phaser.Tweens.TweenManager;
  declare time: Phaser.Time.Clock;
  declare textures: Phaser.Textures.TextureManager;
  declare cameras: Phaser.Cameras.Scene2D.CameraManager;
  declare scene: Phaser.Scenes.ScenePlugin;
  declare load: Phaser.Loader.LoaderPlugin;

  // Components
  public player!: Player;
  public environmentManager!: EnvironmentManager;
  public spawnManager!: SpawnManager;
  public eventManager!: EventManager;
  public collisionManager!: CollisionManager;

  // Visuals
  private sandstormOverlay!: Phaser.GameObjects.TileSprite;
  private sandstormEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private debrisEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  // Game State
  public baseSpeed: number = PHYSICS.RUN_SPEED; 
  private speedModifier: number = 1.0;
  private speedModifierTimer: number = 0;
  
  private currentStage: number = 1;
  private collectedStarsCount: number = 0;
  private runDistance: number = 0;
  private hearts: number = 3;
  private isGameOver: boolean = false;
  
  // UI State
  private activeMessage: string | null = null; 
  private currentNoorMessage: NoorMessage | null = null;
  private messageTimer: Phaser.Time.TimerEvent | null = null;
  private isSoftPaused: boolean = false; 
  private activeQuestion: Question | null = null; 
  private questionPool: Question[] = [];
  
  // Stage results (desert end / library event)
  private correctAnswersCount: number = 0;
  private wrongAnswersCount: number = 0;
  private stageStartTime: number = 0;
  private cityStageStartTime: number = 0;
  private cityStartDistanceForStats: number = 0;
  public stageResults: StageResultsData | null = null;
  public pendingTransition: 'DESERT_END' | 'LIBRARY_END' | null = null;
  
  // Phase 4: Climbing
  public climbProgress: number = 0;
  
  // Guidance Flags
  private guideFlags = {
      welcome: false,
      firstJump: false,
      firstGate: false
  };
  public firstObstacleRef: Obstacle | null = null;

  private lastUiUpdate: number = 0;
  private onScoreUpdate: (data: GameState) => void;

  constructor(onScoreUpdate: (data: GameState) => void) {
    super({ key: 'MainScene' });
    this.onScoreUpdate = onScoreUpdate;
  }

  preload() {
      this.load.crossOrigin = 'anonymous';
      this.load.image('noor_asset', 'https://ucarecdn.com/64926886-4015-49f7-9ebc-f3f206cf82e0/Gemini_Generated_Image_x273efx273efx273removebgpreview.png');
      // Magical portal sound (optional – gate plays when opening)
      this.load.audio('portal_open', 'https://assets.mixkit.co/active_storage/sfx/2570-magical-sweep.mp3');
  }

  create() {
    this.initializeState();
    this.physics.world.setBoundsCollision(true, true, true, false);
    
    // 1. Initialize Managers
    this.environmentManager = new EnvironmentManager(this);
    this.spawnManager = new SpawnManager(this);
    this.eventManager = new EventManager(this);
    this.collisionManager = new CollisionManager(this);

    // 2. Generate Assets
    Player.generateTexture(this);
    Obstacle.generateTextures(this);
    Star.generateTexture(this);
    Heart.generateTexture(this);
    ShieldItem.generateTexture(this);
    MerchantCart.generateTexture(this);
    StackOfRugs.generateTexture(this);
    StreetCat.generateTexture(this); // Gen Cat
    MagicCarpet.init(this); 

    this.environmentManager.create();
    this.spawnManager.create();

    // 3. Create Player
    const height = Math.max(10, Math.ceil(this.scale.height));
    this.player = new Player(this, 100, height - 200);
    this.player.setVariableJump(false);

    // 4. VFX Overlays
    this.createSandstormOverlay();
    this.createSandstormEmitter();

    // 5. Setup Collisions
    this.collisionManager.setupCollisions();

    // 6. Event Listeners
    this.scale.on('resize', this.handleResize, this);
    this.input.on('pointerdown', this.handleGlobalTap, this);

    // 7. Nur intro at center (cinematic), then start running
    this.startNurIntro();
  }

  /** Nur appears at center with welcome message, then fades out and run begins */
  private startNurIntro() {
    const width = this.scale.width;
    const height = this.scale.height;
    const cx = width / 2;
    const cy = height / 2;

    const container = this.add.container(cx, cy);
    container.setDepth(200);

    // Soft glow behind Nur
    if (!this.textures.exists('noor_intro_glow')) {
      const canvas = this.textures.createCanvas('noor_intro_glow', 400, 400);
      if (canvas) {
        const ctx = canvas.context;
        const grd = ctx.createRadialGradient(200, 200, 50, 200, 200, 200);
        grd.addColorStop(0, 'rgba(255, 215, 0, 0.35)');
        grd.addColorStop(0.6, 'rgba(255, 180, 0, 0.15)');
        grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 400, 400);
        canvas.refresh();
      }
    }
    const glow = this.add.image(0, 0, 'noor_intro_glow');
    container.add(glow);

    // Nur character (center)
    const useAsset = this.textures.exists('noor_asset');
    const texKey = useAsset ? 'noor_asset' : 'noor_char';
    const nurSprite = this.add.sprite(0, -80, texKey).setOrigin(0.5, 0.5);
    const scale = Math.min(200 / (nurSprite.width || 1), 200 / (nurSprite.height || 1), 1.2);
    nurSprite.setScale(scale);
    container.add(nurSprite);

    // Arabic welcome message (centered, clean, warm)
    const msg = 'مرحباً بك في مدينة العلم…\nهذه الرحلة لن تكون سهلة،\nلكنني سأكون معك في كل خطوة.';
    const text = this.add.text(0, 120, msg, {
      fontFamily: 'Cairo',
      fontSize: '22px',
      color: '#f5f0e8',
      align: 'center',
      lineSpacing: 10,
      wordWrap: { width: width * 0.75 }
    }).setOrigin(0.5, 0);
    container.add(text);

    container.setAlpha(0);

    // Calm cinematic: fade in
    this.tweens.add({
      targets: container,
      alpha: 1,
      duration: 1800,
      ease: 'Sine.easeOut',
      onComplete: () => {
        // Hold for reading
        this.time.delayedCall(5500, () => {
          // Smooth fade out
          this.tweens.add({
            targets: container,
            alpha: 0,
            duration: 1500,
            ease: 'Sine.easeIn',
            onComplete: () => {
              container.destroy();
              this.eventManager.eventPhase = 'INTRO_RUN';
              this.stageStartTime = this.time.now;
              this.physics.resume();
              this.player.play('run');
            }
          });
        });
      }
    });
  }

  public recordCityStart(distance: number) {
    this.cityStartDistanceForStats = distance;
  }

  public recordCityStageStart() {
    this.cityStageStartTime = this.time.now;
  }

  public showDesertStageResults() {
    this.stageResults = {
      stageName: 'نهاية الصحراء',
      distance: this.runDistance,
      stars: this.collectedStarsCount,
      correctAnswers: this.correctAnswersCount,
      wrongAnswers: this.wrongAnswersCount,
      timeSeconds: (this.time.now - this.stageStartTime) / 1000
    };
    this.pendingTransition = 'DESERT_END';
    this.syncUI();
  }

  public showLibraryStageResults() {
    const distInCity = this.runDistance - this.cityStartDistanceForStats;
    this.stageResults = {
      stageName: 'بيت الحكمة',
      distance: Math.max(0, distInCity),
      stars: this.collectedStarsCount,
      correctAnswers: this.correctAnswersCount,
      wrongAnswers: this.wrongAnswersCount,
      timeSeconds: (this.time.now - this.cityStageStartTime) / 1000
    };
    this.pendingTransition = 'LIBRARY_END';
    this.syncUI();
  }

  public continueAfterStageResults() {
    if (this.pendingTransition === 'DESERT_END') {
      this.eventManager.continueDesertTransition();
    } else if (this.pendingTransition === 'LIBRARY_END') {
      this.eventManager.continueLibraryTransition();
    }
    this.stageResults = null;
    this.pendingTransition = null;
    this.syncUI();
  }

  private initializeState() {
    this.isGameOver = false;
    this.currentStage = 1;
    this.hearts = 3;
    this.runDistance = 0;
    this.collectedStarsCount = 0;
    this.baseSpeed = PHYSICS.RUN_SPEED;
    this.speedModifier = 1.0; 
    this.physics.world.timeScale = 1.0; 
    this.questionPool = getQuestions();
    
    this.guideFlags = { welcome: false, firstJump: false, firstGate: false };
    this.firstObstacleRef = null;
    
    this.activeQuestion = null;
    this.activeMessage = null;
    this.currentNoorMessage = null;
    this.isSoftPaused = false;
    this.climbProgress = 0;
    this.correctAnswersCount = 0;
    this.wrongAnswersCount = 0;
    this.stageResults = null;
    this.pendingTransition = null;
  }

  update(time: number, delta: number) {
    if (this.eventManager.eventPhase === 'NUR_INTRO') return;
    if (this.isGameOver) return;
    if (this.activeMessage || this.activeQuestion) return;
    
    const timeScale = this.physics.world.timeScale;
    const scaledDelta = delta / timeScale; 
    const dt = scaledDelta / 1000;

    this.updateSpeed(scaledDelta, dt);
    const currentSpeed = this.baseSpeed * this.speedModifier;
    const frameMove = (currentSpeed * dt); 

    if (currentSpeed > 0) {
        this.runDistance += frameMove * 0.05; 
    }
    
    const phase = this.eventManager.eventPhase;
    if ((phase === 'SANDSTORM_ONSET' || phase === 'SANDSTORM_WALK' || phase === 'SANDSTORM_APPROACH') && this.sandstormOverlay) {
        this.sandstormOverlay.tilePositionX += (currentSpeed * 0.2) + 25; 
    }
        
    this.environmentManager.update(time, scaledDelta, frameMove);
    this.player.update(time, scaledDelta);
    this.spawnManager.update(scaledDelta, frameMove, currentSpeed);
    this.eventManager.update(frameMove, scaledDelta); 
    this.eventManager.handleEncounterPause(this.player.x);
    
    // Check dynamic overlaps (Carpet)
    this.collisionManager.checkDynamicOverlaps();

    this.checkGuidanceTriggers();

    if (time > this.lastUiUpdate + 100) {
        this.syncUI();
        this.lastUiUpdate = time;
    }
    
    // --- BOUNDS CHECK ---
    // If Flying, bounds are different
    if (!this.player.isFlying && this.player.y > this.scale.height + 50) {
        this.damagePlayer(true); 
    }
  }

  // ... (Rest of the file remains same, keeping methods to ensure full file content logic) ...
  public advanceStage() {
      this.currentStage++;
      this.baseSpeed = PHYSICS.RUN_SPEED + ((this.currentStage - 1) * 20); 
  }

  private createSandstormOverlay() {
      const { width, height } = this.scale;
      this.sandstormOverlay = this.add.tileSprite(width/2, height/2, width, height, 'sandstorm_overlay');
      this.sandstormOverlay.setScrollFactor(0);
      this.sandstormOverlay.setDepth(100); 
      this.sandstormOverlay.setAlpha(0); 
      this.sandstormOverlay.setBlendMode(Phaser.BlendModes.OVERLAY);
  }

  private createSandstormEmitter() {
      if (!this.textures.exists('wind_particle')) {
          const canvas = this.textures.createCanvas('wind_particle', 32, 4);
          if (canvas) {
              const ctx = canvas.context;
              const grd = ctx.createLinearGradient(0, 0, 32, 0);
              grd.addColorStop(0, 'rgba(255, 235, 200, 0)');
              grd.addColorStop(0.5, 'rgba(255, 235, 200, 0.8)');
              grd.addColorStop(1, 'rgba(255, 235, 200, 0)');
              ctx.fillStyle = grd;
              ctx.fillRect(0, 0, 32, 4);
              canvas.refresh();
          }
      }
      const { width, height } = this.scale;
      this.sandstormEmitter = this.add.particles(width + 50, 0, 'wind_particle', {
          y: { min: 0, max: height },
          speedX: { min: -1200, max: -800 },
          speedY: { min: -50, max: 50 },
          scaleX: { min: 1, max: 3 },
          scaleY: { min: 0.5, max: 1 },
          alpha: { start: 0.6, end: 0 },
          lifespan: 1500,
          quantity: 4,
          frequency: 50,
          blendMode: 'ADD',
          emitting: false
      });
      this.sandstormEmitter.setDepth(101); 
      this.sandstormEmitter.setScrollFactor(0);
  }

  public triggerSandstormEffects(active: boolean) {
      if (active) this.sandstormEmitter.start(); else this.sandstormEmitter.stop();
  }

  public triggerDebris(active: boolean) {
      if (!this.debrisEmitter) this.createDebrisEmitter();
      if (active) this.debrisEmitter.start(); else this.debrisEmitter.stop();
  }

  private createDebrisEmitter() {
      if (!this.textures.exists('debris_chunk')) {
          const canvas = this.textures.createCanvas('debris_chunk', 16, 16);
          if (canvas) {
              const ctx = canvas.context;
              ctx.fillStyle = '#5d4037'; 
              ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(16, 6); ctx.lineTo(10, 16); ctx.lineTo(0, 10); ctx.fill();
              canvas.refresh();
          }
      }
      this.debrisEmitter = this.add.particles(0, 0, 'debris_chunk', {
          x: { min: 0, max: this.scale.width },
          y: -50,
          lifespan: 2000,
          speedY: { min: 400, max: 800 },
          speedX: { min: -100, max: 100 },
          scale: { min: 0.5, max: 1.5 },
          rotate: { min: 0, max: 360 },
          quantity: 2,
          frequency: 50,
          emitting: false
      });
      this.debrisEmitter.setDepth(102); 
      this.debrisEmitter.setScrollFactor(0);
  }

  public startSandstorm() {
      this.tweens.add({ targets: this, speedModifier: 0.3, duration: 2000, ease: 'Power2' });
      this.tweens.add({ targets: this.sandstormOverlay, alpha: 0.8, duration: 2500, ease: 'Sine.easeInOut' });
      this.triggerSandstormEffects(true);
      this.player.startStruggle();
      this.showNoorMessage("يا إلهي! عاصفة رملية تقترب! 🌪️", false);
  }

  public endSandstorm() {
      this.tweens.add({ targets: this.sandstormOverlay, alpha: 0, duration: 2000, ease: 'Sine.easeInOut' });
      this.triggerSandstormEffects(false);
      this.tweens.add({ targets: this, speedModifier: 1.0, duration: 1000 });
  }

  private updateSpeed(delta: number, dt: number) {
      if (this.eventManager.eventPhase.startsWith('INTRO') || this.eventManager.eventPhase.startsWith('LEVEL')) return;

      if (!this.eventManager.isEncounterActive && this.eventManager.eventPhase === 'NONE') {
          if (this.speedModifierTimer > 0) {
              this.speedModifierTimer -= delta;
              if (this.speedModifierTimer <= 0) {
                  this.tweens.add({ targets: this, speedModifier: 1.0, duration: 1000 });
              }
          }
          const maxSpeed = PHYSICS.RUN_SPEED + (this.currentStage * 25); 
          if (this.baseSpeed < maxSpeed) {
              this.baseSpeed += dt * 1.5; 
          }
      }
  }

  private checkGuidanceTriggers() {
      if (this.firstObstacleRef?.active && !this.guideFlags.firstJump) {
          const dist = this.firstObstacleRef.x - this.player.x;
          if (dist < 150 && dist > 20) {
              this.guideFlags.firstJump = true;
              this.showNoorMessage("اضغط للقفز وتجاوز العقبات! 🏃", true);
          }
      }
  }

  private handleResize(gameSize: Phaser.Structs.Size) {
      const width = gameSize.width;
      const height = gameSize.height;
      this.cameras.main.setViewport(0, 0, width, height);
      this.environmentManager.resize(width, height);
      if (this.sandstormOverlay) {
          this.sandstormOverlay.setPosition(width/2, height/2);
          this.sandstormOverlay.setSize(width, height);
      }
      if (this.sandstormEmitter) {
          this.sandstormEmitter.setPosition(width + 50, 0);
      }
      if (this.player.y > height + 200 && !this.eventManager.eventPhase.startsWith('INTRO') && !this.player.isFlying) {
          this.player.y = height - 200;
          this.player.setVelocityY(0);
      }
  }

  private handleGlobalTap() {
      if (this.eventManager.eventPhase === 'NUR_INTRO') return;
      if (this.eventManager.eventPhase.startsWith('INTRO')) return;
      if (this.eventManager.eventPhase.startsWith('LEVEL')) return;

      if (this.isSoftPaused) {
          this.isSoftPaused = false;
          this.physics.world.timeScale = 1.0; 
          this.hideNoorMessage();
          this.player.setVelocityY(PHYSICS.JUMP_FORCE);
          return;
      }

      if (this.player.isHanging) {
          this.climbProgress += 15; 
          if (this.climbProgress > 100) this.climbProgress = 100;
          this.syncUI();
          this.tweens.add({ targets: this.player, y: this.player.y - 2, duration: 50, yoyo: true });
          if (this.climbProgress >= 100) {
              this.completeClimb();
          }
          return; 
      }
  }
  
  private completeClimb() {
      const targetY = this.player.y - 30; 
      this.player.climbUp(targetY, () => {
          this.climbProgress = 0;
          this.eventManager.eventPhase = 'RECOVERY';
          this.showNoorMessage("أحسنت! ذلك كان وشيكاً! 😅");
          this.time.delayedCall(1000, () => {
              this.setGameSpeed(1.0);
              this.eventManager.eventPhase = 'NONE';
          });
      });
  }
  
  public setGameSpeed(modifier: number) {
      this.speedModifier = modifier;
  }
  
  public getGameSpeed(): number {
      return this.speedModifier;
  }

  public getRunDistance(): number { return this.runDistance; }
  public getCurrentStage(): number { return this.currentStage; }
  
  public addScore(amount: number) {
      this.collectedStarsCount += amount;
  }

  public addHeart(): boolean {
      if (this.hearts < 5) {
          this.hearts++;
          return true;
      }
      return false;
  }

  public replenishHealth() {
      const diff = 5 - this.hearts;
      if (diff > 0) {
          let count = 0;
          this.time.addEvent({
              delay: 300,
              repeat: diff - 1,
              callback: () => {
                  this.addHeart();
                  count++;
                  this.showFloatingText(this.player.x, this.player.y - 50 - (count*20), "❤", '#ff4d4d');
              }
          });
          this.addHeart();
          this.showFloatingText(this.player.x, this.player.y - 50, "❤", '#ff4d4d');
      }
  }

  public damagePlayer(fatal: boolean = false) {
      // Only skip damage during cinematic intros (Nur intro, city intro), not during desert run (INTRO_RUN)
      if (this.eventManager.eventPhase === 'NUR_INTRO') return;
      if (this.eventManager.eventPhase === 'STAGE_2_INTRO') return;
      if (this.eventManager.eventPhase.startsWith('LEVEL')) return;

      if (fatal) {
          this.hearts = 0;
          this.gameOver();
          return;
      }
      this.hearts--;
      if (this.hearts <= 0) this.gameOver();
  }

  public showFloatingText(x: number, y: number, text: string, color: string = '#ffd700') {
      const txt = this.add.text(x, y, text, {
          fontFamily: 'Cairo', fontSize: '24px', fontStyle: 'bold', color: color, stroke: '#000', strokeThickness: 3
      }).setOrigin(0.5);
      this.tweens.add({ targets: txt, y: y - 50, alpha: 0, duration: 800, onComplete: () => txt.destroy() });
  }

  public showNoorMessage(text: string, isSoftPause: boolean = false) {
      if (this.currentNoorMessage && !isSoftPause && this.currentNoorMessage.isSoftPause) return;
      if (this.messageTimer) this.messageTimer.remove();

      this.currentNoorMessage = { text, isSoftPause };
      if (isSoftPause) {
          this.isSoftPaused = true;
          this.physics.world.timeScale = 10.0; 
      } else {
          // Duration based on text length + importance
          const duration = this.eventManager.eventPhase.startsWith('INTRO') || this.eventManager.eventPhase.startsWith('LEVEL') ? 4000 : 3000;
          this.messageTimer = this.time.delayedCall(duration, () => this.hideNoorMessage());
      }
      this.syncUI();
  }

  public hideNoorMessage() {
      this.currentNoorMessage = null;
      this.syncUI();
  }

  public pauseGameplayForQuestion(specificId?: string) {
      this.speedModifier = 0; 
      this.player.anims.pause();
      if (this.physics.world.isPaused === false) {
           this.physics.pause();
           this.hideNoorMessage();
           this.showQuestionUI(specificId);
      }
  }

  private showQuestionUI(specificId?: string) {
      if (this.activeQuestion) return;
      let question: Question | undefined;
      if (specificId) {
          const allQuestions = getQuestions();
          question = allQuestions.find(q => q.id === specificId);
      }
      if (!question) {
          if (this.questionPool.length === 0) this.questionPool = getQuestions();
          question = this.questionPool.pop();
      }
      if (question) {
          this.activeQuestion = question;
          this.syncUI();
      }
  }

  public resumeGameFromNoor(isCorrect: boolean) {
      if (isCorrect) {
          this.correctAnswersCount++;
          this.activeQuestion = null; 
          this.eventManager.isEncounterOpening = true;
          this.syncUI();

          if (this.eventManager.encounterType === 'GATE' && this.eventManager.currentGate) {
              this.eventManager.currentGate.open();
              this.handlePostAnswerDelay(false); 
          } else if (this.eventManager.encounterType === 'CHEST' && this.eventManager.currentChest) {
              this.eventManager.currentChest.open(() => {
                  const reward = Phaser.Math.Between(5, 20);
                  this.addScore(reward);
                  this.showFloatingText(this.player.x, this.player.y - 100, `+${reward} نجمة!`, '#ffd700');
                  this.handlePostAnswerDelay(false);
              });
          } 
      } else {
          this.wrongAnswersCount++;
          this.syncUI();
      }
  }

  private handlePostAnswerDelay(advanceStage: boolean) {
      this.time.delayedCall(1000, () => {
         this.physics.resume();
         this.player.anims.resume();
         this.speedModifier = 1.0; 
         
         this.time.delayedCall(3000, () => {
             this.eventManager.isEncounterActive = false;
             this.eventManager.encounterType = 'NONE';
             this.eventManager.eventPhase = 'NONE';
             
             if (this.eventManager.currentGate) { this.eventManager.currentGate.destroy(); this.eventManager.currentGate = null; }
             if (this.eventManager.currentChest) { this.eventManager.currentChest.destroy(); this.eventManager.currentChest = null; }
         });
      });
  }

  public dismissMessage() {
      this.activeMessage = null;
      this.physics.resume();
      this.player.play('run');
      this.syncUI();
  }

  private syncUI() {
      this.onScoreUpdate({
          distance: this.runDistance,
          stars: this.collectedStarsCount,
          hearts: this.hearts,
          isGameOver: this.isGameOver,
          activeQuestion: this.activeQuestion || undefined,
          activeMessage: this.activeMessage || undefined,
          noorMessage: this.currentNoorMessage,
          isHanging: this.player?.isHanging || false,
          climbProgress: this.climbProgress,
          stageResults: this.stageResults || undefined
      });
  }

  private gameOver() {
      this.isGameOver = true;
      this.physics.pause();
      this.player.setTint(0x555555);
      this.syncUI();
  }
}
