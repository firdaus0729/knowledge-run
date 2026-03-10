
import Phaser from 'phaser';
import { PROGRESS, getPlayerStartX, getGroundY, getPlayerSpawnY, GROUND_TILE_HEIGHT } from '../../constants';
import { MainScene } from '../scenes/MainScene';
import { MagicGate } from '../objects/MagicGate';
import { MagicChest } from '../objects/MagicChest';
import { BedouinTent } from '../objects/BedouinTent';
import { LibraryBuilding } from '../objects/LibraryBuilding';
import { MagicCarpet } from '../objects/MagicCarpet';
import { Obstacle } from '../objects/Obstacle';
import type { ActivePuzzle } from '../../types';

export type EventPhase = 
    'NONE' | 
    'NUR_INTRO' |
    'INTRO_RUN' | 
    'LEVEL_END_APPROACH' | 'LEVEL_END_GATE' | 'LEVEL_TRANSITION' |
    'STAGE_2_INTRO' |
    'RECOVERY' | 
    'SANDSTORM_ONSET' | 'SANDSTORM_WALK' | 'SANDSTORM_APPROACH' | 'SANDSTORM_SHELTER' | 
    'LIBRARY_APPROACH' | 'LIBRARY_ENTRY' | 
    'CARPET_RIDE' | 
    'HANGING';

export type EncounterType = 'NONE' | 'GATE' | 'CHEST' | 'CARPET';

export class EventManager {
  private scene: MainScene;
  
  // State
  public eventPhase: EventPhase = 'NUR_INTRO'; 
  public encounterType: EncounterType = 'NONE';
  public queuedEncounter: EncounterType = 'NONE';
  public isEncounterActive: boolean = false;
  public isEncounterOpening: boolean = false;
  
  public currentGate: MagicGate | null = null;
  public currentChest: MagicChest | null = null;
  public currentCarpet: MagicCarpet | null = null;
  /** Gate blocking the magic carpet path until puzzle is solved. */
  public currentCarpetGate: Phaser.GameObjects.Sprite | null = null;
  public libraryBuilding: LibraryBuilding | null = null;
  
  // Intro Specific
  private introTimer: number = 0;

  // Level Progression (Step 2: distances in meters)
  private readonly STAGE_1_LENGTH = PROGRESS.STAGE_1_LENGTH_M;
  /** Distance in meters before sandstorm – after some gameplay (obstacles, questions) */
  private readonly SANDSTORM_TRIGGER_DISTANCE = 230;
  private levelEndTriggered: boolean = false;

  /** Distance in meters before next chest spawn (tunable) */
  private readonly CHEST_INTERVAL_M = 150;
  private nextChestDistance: number = 0;
  private hasSpawnedChestSegment: boolean = false;

  // Sandstorm
  private sandstormTriggered: boolean = false;
  private sandstormTimer: number = 0;
  public refugeTent: BedouinTent | null = null;

  // Library Event
  private libraryStartDistance: number = 0;
  private libraryEventTriggered: boolean = false;
  private carpetTimer: number = 0;
  private hasTransitionedToCity: boolean = false;
  /** How the magic carpet is being used (library transition vs. short side path in city). */
  private carpetMode: 'LIBRARY' | 'CITY_SIDE' = 'LIBRARY';

  /** Distance in meters within library zone before carpet spawns (tunable) */
  public readonly STAGE_2_LENGTH_M = PROGRESS.STAGE_2_LENGTH_M;
  private readonly CARPET_SPAWN_DIST_M = 400;
  private carpetMissed: boolean = false;
  private nextCarpetSpawnPos: number = 0;
  /** True once Stage 2 has been ended (library results shown) so we don't trigger again. */
  private stage2EndTriggered: boolean = false;
  
  // Tutorial Flags for Flow
  private hasTriggeredRooftopTutorial: boolean = false;

  // Puzzle sequences (storm: 3–5 puzzles; library: 3–5 puzzles)
  private stormPuzzleQueue: ActivePuzzle[] = [];
  private stormPuzzleIndex: number = 0;
  private libraryPuzzleQueue: ActivePuzzle[] = [];
  private libraryPuzzleIndex: number = 0;
  /** When true, carpet overlap shows a puzzle; correct = ride, wrong = Bayt path. */
  private carpetGatePending: boolean = false;
  private libraryPuzzleSequenceActive: boolean = false;

  constructor(scene: MainScene) {
    this.scene = scene;
    this.calculateNextChestDistance(PROGRESS.STAGE_1_LENGTH_M);
  }

  public update(frameMove: number, delta: number) {
      if (this.currentGate) {
          if (this.currentGate.active) this.currentGate.update(frameMove);
          else this.currentGate = null;
      }
      if (this.currentChest) {
          if (this.currentChest.active) this.currentChest.update(frameMove);
          else this.currentChest = null;
      }
      
      // Update carpet gate (scroll with world)
      if (this.currentCarpetGate) {
          if (this.currentCarpetGate.active) {
              this.currentCarpetGate.x -= frameMove;
              // Static bodies do not sync with the game object – must update so overlap detects correctly
              const gateBody = this.currentCarpetGate.body as Phaser.Physics.Arcade.StaticBody;
              if (gateBody?.updateFromGameObject) gateBody.updateFromGameObject();
              if (this.currentCarpetGate.x < -80) {
                  this.currentCarpetGate.destroy();
                  this.currentCarpetGate = null;
              }
          } else {
              this.currentCarpetGate = null;
          }
      }

      // Update Carpet & Check for Miss
      if (this.currentCarpet) {
          if (this.currentCarpet.active) {
              if (!this.scene.player.isFlying) {
                  this.currentCarpet.update(frameMove);
              }
          } else {
              // Carpet was destroyed (went off screen)
              if (this.eventPhase !== 'CARPET_RIDE') {
                  this.handleCarpetMiss();
              }
              this.currentCarpet = null;
          }
      }

      // --- OBJECT MANAGEMENT ---
      if (this.refugeTent && this.refugeTent.active) {
          if (this.eventPhase === 'SANDSTORM_APPROACH') {
              this.refugeTent.x -= frameMove;
              const stopX = this.scene.scale.width / 2;
              if (this.refugeTent.x <= stopX) {
                  this.refugeTent.x = stopX;
                  this.triggerSandstormArrival();
              }
          } else {
              this.refugeTent.x -= frameMove;
              if (this.refugeTent.x < -600) {
                  this.refugeTent.destroy();
                  this.refugeTent = null;
              }
          }
      }

      if (this.libraryBuilding && this.libraryBuilding.active) {
          if (this.eventPhase === 'LIBRARY_APPROACH') {
              this.libraryBuilding.x -= frameMove;
              const stopX = this.scene.scale.width / 2;
              if (this.libraryBuilding.x <= stopX) {
                  this.libraryBuilding.x = stopX;
                  this.triggerLibraryArrival();
              }
          } else {
              this.libraryBuilding.x -= frameMove;
              if (this.libraryBuilding.x < -600) {
                  this.libraryBuilding.destroy();
                  this.libraryBuilding = null;
              }
          }
      }

      // --- PHASE LOGIC ---

      // CARPET FLIGHT LOGIC
      if (this.eventPhase === 'CARPET_RIDE') {
          this.carpetTimer += delta;
          
          const platform = this.scene.environmentManager.platform;
          // Slowly move platform down to simulate gaining altitude
          // Stop when deep enough to be hidden
          if (platform.body.y < this.scene.scale.height + 400) {
               platform.body.y += 3; 
               // @ts-ignore
               platform.groundTile.y += 3;
          }

          // Trigger visual transition mid-flight when ground is hidden (library -> city only)
          if (this.carpetMode === 'LIBRARY' && this.carpetTimer > 2000 && !this.hasTransitionedToCity) {
              this.hasTransitionedToCity = true;
              this.scene.environmentManager.transitionLibraryToCity();
          }

          // End flight after duration (longer for library so player enjoys flying more)
          const maxDuration = this.carpetMode === 'LIBRARY' ? 26000 : 9000;
          if (this.carpetTimer > maxDuration) {
              this.endCarpetRide();
          }
      }

      if (this.eventPhase === 'INTRO_RUN') {
          // Sandstorm only after player has run a noticeable distance (dramatic, not rushed)
          if (this.scene.getRunDistance() >= this.SANDSTORM_TRIGGER_DISTANCE) {
              this.triggerSandstorm();
          }
      } 
      else if (this.eventPhase === 'LEVEL_END_APPROACH') {
          if (this.currentGate && this.currentGate.active) {
              const centerX = this.scene.scale.width / 2;
              const distToCenter = this.currentGate.x - centerX;
              if (distToCenter <= 350) {
                  this.scene.setGameSpeed(0.55);
              } else {
                  this.scene.setGameSpeed(1.0);
              }
              if (this.currentGate.x <= centerX) {
                  this.currentGate.x = centerX; 
                  this.triggerGateArrival();
              }
          }
      }
      else if (this.eventPhase === 'SANDSTORM_ONSET') {
          this.sandstormTimer += delta;
          if (this.sandstormTimer > 2500) {
              this.eventPhase = 'SANDSTORM_WALK';
              this.sandstormTimer = 0;
          }
      }
      else if (this.eventPhase === 'SANDSTORM_WALK') {
          this.sandstormTimer += delta;
          if (this.sandstormTimer > 5000) { 
              this.triggerSandstormDiscovery();
          }
      }

      // Standard checks (chest + level end also during desert run so obstacles/stars/chests appear from start)
      if (!this.isEncounterActive) {
          if (this.eventPhase === 'NONE') {
              this.checkLevelEnd();
              this.checkStage2End();
              this.checkLibraryEvent();
          }
          if (this.eventPhase === 'NONE' || this.eventPhase === 'INTRO_RUN') {
              this.checkChestThreshold();
          }
      }
  }

  /** End Stage 2 only after running the full city distance (STAGE_2_LENGTH_M), not at library entry. */
  private checkStage2End() {
      if (this.stage2EndTriggered || this.scene.getCurrentStage() !== 2) return;
      const cityStart = this.scene.getCityStartDistance();
      if (cityStart < 0) return;
      const distInCity = this.scene.getRunDistance() - cityStart;
      if (distInCity >= this.STAGE_2_LENGTH_M) {
          this.stage2EndTriggered = true;
          this.scene.setGameSpeed(0);
          this.scene.showLibraryStageResults();
      }
  }

  // --- GUIDANCE TRIGGERS ---
  
  public triggerRooftopTutorial() {
      if (this.hasTriggeredRooftopTutorial) return;
      this.hasTriggeredRooftopTutorial = true;

      this.scene.showNoorMessage('استعد… التحدي يقترب.', false, 'warning');
  }

  // --- CARPET EVENT ---
  private checkLibraryEvent() {
      if (this.scene.environmentManager.getZone() === 'LIBRARY') {
          if (this.libraryStartDistance === 0) this.libraryStartDistance = this.scene.getRunDistance();
          const distInLibrary = this.scene.getRunDistance() - this.libraryStartDistance;
          
          // Case 1: Initial Spawn
          if (!this.libraryEventTriggered && distInLibrary > this.CARPET_SPAWN_DIST_M) {
              this.libraryEventTriggered = true;
              this.spawnMagicCarpet();
          }
          
          // Case 2: Respawn if missed
          if (this.carpetMissed && this.scene.getRunDistance() > this.nextCarpetSpawnPos) {
              this.carpetMissed = false; // Reset flag
              this.spawnMagicCarpet();
          }
      }
  }

  private handleCarpetMiss() {
      // Called when carpet destroys itself without being collected
      this.carpetMissed = true;
      this.nextCarpetSpawnPos = this.scene.getRunDistance() + this.CARPET_SPAWN_DIST_M;
      this.encounterType = 'NONE';
      this.scene.showNoorMessage("لقد فاتنا البساط! لا تقلق، سيظهر مرة أخرى.", false, 'greet');
  }

  private spawnMagicCarpet() {
      const spawnX = this.scene.scale.width + 400;
      const groundY = getGroundY(this.scene.scale.height);
      
      this.currentCarpet = new MagicCarpet(this.scene, spawnX, groundY);
      this.encounterType = 'CARPET';
      this.carpetMode = 'LIBRARY';
      this.scene.showNoorMessage("انظر! بساط الريح السحري! اقفز عليه! 🧞‍♂️", false, 'greet');
  }

  /** Spawn the gate that blocks the magic carpet path; carpet spawns only after puzzle is solved. */
  public spawnDualPathCarpetGate(spawnX: number, platformY: number) {
      if (this.currentCarpetGate) return;
      if (!this.scene.textures.exists('carpet_gate')) return;
      // Place gate on the platform (platformY = carpet/platform height)
      const gate = this.scene.add.sprite(spawnX, platformY - 55, 'carpet_gate');
      gate.setDepth(22); // In front of platforms and obstacles
      gate.setScale(1.2); // Slightly larger so the entrance is easy to see
      this.scene.physics.add.existing(gate, true);
      const body = (gate.body as Phaser.Physics.Arcade.Body);
      // Large hitbox so overlap triggers reliably (texture 100x130, scaled 1.2)
      body.setSize(100, 130);
      body.setOffset(0, 0); // Full sprite area for overlap
      this.currentCarpetGate = gate;
      this.encounterType = 'CARPET';
      this.carpetMode = 'CITY_SIDE';
      this.carpetGatePending = false;
      // Message shown when player overlaps gate (in onCarpetGateOverlap), not at spawn
  }

  /** Spawn a Magic Carpet (used after gate puzzle is solved). */
  public spawnDualPathMagicCarpet(spawnX: number, groundY: number) {
      this.currentCarpet = new MagicCarpet(this.scene, spawnX, groundY);
      this.encounterType = 'CARPET';
      this.carpetMode = 'CITY_SIDE';
      this.carpetGatePending = false;
  }

  /** True when the carpet path is the city dual-path one (gate or carpet; puzzle required before ride). */
  public getCarpetGateRequired(): boolean {
      return this.carpetMode === 'CITY_SIDE' && (this.currentCarpet != null || this.currentCarpetGate != null);
  }

  /** Gate object at the carpet path (overlap triggers puzzle). */
  public getCurrentCarpetGate(): Phaser.GameObjects.Sprite | null {
      return this.currentCarpetGate?.active ? this.currentCarpetGate : null;
  }

  /** Clear any existing carpet gate (e.g. before spawning gate on elevated bridge). */
  public clearCarpetGate(): void {
      if (this.currentCarpetGate?.active) {
          this.currentCarpetGate.destroy();
          this.currentCarpetGate = null;
      }
      this.carpetGatePending = false;
  }

  /** Called when player overlaps the gate or the dual-path carpet: show puzzle instead of instant ride. */
  public onCarpetOverlap(): void {
      if (this.carpetGatePending) return;
      this.carpetGatePending = true;
      this.scene.showPuzzle({
          type: 'CARPET_GATE',
          prompt: 'بوابة البساط السحري\n\nقبل أن تركب البساط السحري، عليك أن تثبت حكمتك.\n\nاختر الرمز الذي يمثّل المعرفة لتبدأ الرحلة.',
          options: ['📚', '⚔️', '🏹'],
          correctIndex: 0,
          timeoutMs: 8000
      });
  }

  /** Called when player overlaps the carpet gate (before puzzle). */
  public onCarpetGateOverlap(): void {
      if (!this.currentCarpetGate?.active || this.carpetGatePending) return;
      this.scene.showNoorMessage('قبل أن تركب البساط السحري، عليك أن تثبت حكمتك.', false, 'greet');
      this.onCarpetOverlap();
  }

  /** Called by MainScene when CARPET_GATE puzzle is resolved. Correct = open gate, spawn carpet, ride; wrong = Bayt path. */
  public finishCarpetGatePuzzle(isCorrect: boolean) {
      this.carpetGatePending = false;
      if (isCorrect) {
          const gx = this.currentCarpetGate?.x ?? 0;
          const gy = this.currentCarpetGate?.y ?? 0;
          if (this.currentCarpetGate?.active) {
              this.currentCarpetGate.destroy();
              this.currentCarpetGate = null;
          }
          this.spawnDualPathMagicCarpet(gx, gy + 50);
          this.triggerCarpetRide();
      } else {
          if (this.currentCarpetGate?.active) {
              this.currentCarpetGate.destroy();
              this.currentCarpetGate = null;
          }
          if (this.currentCarpet?.active) {
              this.currentCarpet.destroy();
              this.currentCarpet = null;
          }
          this.encounterType = 'NONE';
          this.isEncounterActive = false;
          this.scene.showNoorMessage("نكمل طريقنا إلى بيت الحكمة. 🏛️", false, 'greet');
      }
  }

  public triggerCarpetRide() {
      if (this.eventPhase === 'CARPET_RIDE') return;
      
      this.eventPhase = 'CARPET_RIDE';
      this.carpetTimer = 0;
      this.hasTransitionedToCity = false;
      this.isEncounterActive = true;
      this.carpetMissed = false; // Successfully caught
      
      this.scene.player.startFlying();
      this.scene.setGameSpeed(1.5); 
      
      this.scene.spawnManager.obstacles.clear(true, true);
      
      // HIDE GROUND LAYERS
      this.scene.environmentManager.background.setFlightMode(true);
      
      this.scene.showNoorMessage("تمسك جيداً! لنحلق فوق الغيوم! ✨", false, 'greet');
      
      if (this.currentCarpet) {
          this.currentCarpet.destroy();
          this.currentCarpet = null;
      }
  }

  private endCarpetRide() {
      this.eventPhase = 'NONE';
      this.isEncounterActive = false;
      this.encounterType = 'NONE';
      
      const platform = this.scene.environmentManager.platform;
      const h = this.scene.scale.height;

      // SHOW GROUND LAYERS
      this.scene.environmentManager.background.setFlightMode(false);

      // Bring ground back up to correct position (raised ground)
      const tileBottomY = getGroundY(h) + GROUND_TILE_HEIGHT;
      this.scene.tweens.add({
          targets: platform.groundTile,
          y: tileBottomY,
          duration: 1000,
          ease: 'Power2.out'
      });

      this.scene.tweens.add({
          targets: platform.body,
          y: getGroundY(h) + GROUND_TILE_HEIGHT / 2,
          duration: 1000,
          ease: 'Power2.out',
          onComplete: () => {
              this.scene.player.stopFlying(); // Land
              this.scene.setGameSpeed(1.0);
              this.scene.environmentManager.finalizeCityTransition();
              // If the carpet rolled past the library entrance, trigger the entrance now so the event unfolds.
              this.scene.environmentManager.triggerLibraryIfPastEntrance();
          }
      });
  }

  // --- SPAWN CONTROL ---
  public isSpawningAllowed(): boolean {
      if (this.eventPhase === 'STAGE_2_INTRO') return false; 
      if (this.eventPhase === 'CARPET_RIDE') return true; 
      // Allow spawning in desert (INTRO_RUN) and normal run (NONE)
      if (this.eventPhase !== 'NONE' && this.eventPhase !== 'INTRO_RUN') return false;
      if (this.isEncounterActive) return false;
      if (!this.levelEndTriggered && this.scene.getRunDistance() >= this.STAGE_1_LENGTH - 100) return false;
      
      // PRE-CARPET SILENCE (Before initial spawn only)
      if (this.scene.environmentManager.getZone() === 'LIBRARY' && !this.libraryEventTriggered && !this.carpetMissed) {
          const distInLibrary = this.scene.getRunDistance() - this.libraryStartDistance;
          if (distInLibrary > this.CARPET_SPAWN_DIST_M - 100) {
              return false;
          }
      }

      return true;
  }

  // --- HANGING ---
  public triggerHanging(x: number, y: number) {
      this.eventPhase = 'HANGING';
      this.scene.setGameSpeed(0);
      this.scene.player.startHanging(x, y);
  }

  // --- LEVEL END ---
  private checkLevelEnd() {
      if (!this.levelEndTriggered && this.scene.getRunDistance() >= this.STAGE_1_LENGTH && this.scene.getCurrentStage() === 1) {
          this.levelEndTriggered = true;
          this.triggerLevelEndSequence();
      }
  }

  private triggerLevelEndSequence() {
      this.eventPhase = 'LEVEL_END_APPROACH';
      const spawnX = this.scene.scale.width + 300; 
      const groundY = getGroundY(this.scene.scale.height);
      this.currentGate = new MagicGate(this.scene, spawnX, groundY - 50);
      this.isEncounterActive = true;
      this.encounterType = 'GATE';
      this.scene.playSfx('eventAppear');
  }

  private triggerGateArrival() {
      this.eventPhase = 'LEVEL_END_GATE';
      this.scene.setGameSpeed(0); 
      this.scene.player.play('run');
      this.scene.player.stopStruggle(); 
      this.activateLevelGate();
  }

  private activateLevelGate() {
      if (this.currentGate && this.currentGate.active) {
          this.scene.showNoorMessage("هذه بوابة الانتقال... ستقودنا إلى المدينة.", false, 'greet');
          this.scene.time.delayedCall(2000, () => {
              this.scene.hideNoorMessage();
              if (this.currentGate) this.currentGate.open();
              if (this.scene.nurController) {
                  this.scene.nurController.show('success', { position: 'top' });
              }
              // Movie-like: character actually enters the magic gate (walk into the light)
              this.scene.time.delayedCall(700, () => {
                  this.playCharacterEnteringGate();
              });
          });
      }
  }

  /** Character walks into the portal center and fades into the light (movie moment). */
  private playCharacterEnteringGate() {
      const player = this.scene.player;
      const gate = this.currentGate;
      if (!gate || !gate.active) {
          this.scene.showDesertStageResults();
          return;
      }
      const centerX = this.scene.scale.width / 2;
      const portalCenterY = gate.y - 220;
      player.setDepth(30);
      this.scene.time.delayedCall(960, () => {
          this.scene.cameras.main.flash(400, 255, 220, 150);
      });
      this.scene.tweens.add({
          targets: player,
          x: centerX,
          y: portalCenterY,
          scale: 0.22,
          alpha: 0,
          duration: 1600,
          ease: 'Cubic.in',
          onComplete: () => {
              this.scene.cameras.main.fadeOut(1200, 255, 220, 150);
              this.scene.cameras.main.once('camerafadeoutcomplete', () => {
                  this.scene.showDesertStageResults();
              });
          }
      });
  }

  public continueDesertTransition() {
      this.scene.cameras.main.fadeOut(1800, 255, 220, 150);
      this.scene.cameras.main.once('camerafadeoutcomplete', () => {
          this.startStage2Transition();
      });
  }

  private startStage2Transition() {
      this.eventPhase = 'LEVEL_TRANSITION';
      this.scene.recordCityStart(this.scene.getRunDistance());
      this.scene.advanceStage();
      this.scene.environmentManager.transitionToCity();
      if (this.currentGate) {
          this.currentGate.destroy();
          this.currentGate = null;
      }
      // Reset player after “entering gate” (scale/alpha were tweened)
      const player = this.scene.player;
      player.setScale(1);
      player.setAlpha(1);
      player.setDepth(20);
      player.setPosition(getPlayerStartX(this.scene.scale.width), getPlayerSpawnY(this.scene.scale.height));
      this.scene.time.delayedCall(2000, () => {
          this.beginStage2Intro();
      });
  }

  private beginStage2Intro() {
      this.eventPhase = 'STAGE_2_INTRO';
      this.scene.setGameSpeed(0);
      this.scene.cameras.main.fadeIn(2000);

      this.scene.cameras.main.once('camerafadeincomplete', () => {
          this.scene.recordCityStageStart();
          this.scene.playMusic('city');
          // Step 2: show stage title first (2.5 s), then Noor message
          this.scene.showStageTitle('المرحلة 2 – مدخل المدينة', 2500, () => {
              this.scene.showNoorMessage("مرحبًا بك في مدينة العلم…\nقد لا تكون الرحلة سهلة،\nلكنني سأكون معك في كل خطوة.", false, 'greet');

              this.scene.time.delayedCall(5000, () => {
                  this.scene.hideNoorMessage();
                  this.eventPhase = 'NONE';
                  this.isEncounterActive = false;
                  this.encounterType = 'NONE';

                  this.scene.setGameSpeed(1.0);
                  this.scene.player.play('run');
              });
          });
      });
  }

  public continueLibraryTransition() {
      this.scene.showNoorMessage("أهلاً بك في عالم المعرفة. 📚", false, 'greet');
      this.scene.time.delayedCall(3500, () => {
          this.scene.hideNoorMessage();
          this.eventPhase = 'NONE';
          this.isEncounterActive = false;
          this.encounterType = 'NONE';
          this.scene.player.isScripted = false;
          this.scene.setGameSpeed(1.0);
          this.scene.player.play('run');
      });
  }

  /** Returns true if the library entrance was actually started (so caller can mark trigger done). */
  public triggerLibraryDiscovery(): boolean {
      if (this.eventPhase !== 'NONE') return false;
      this.eventPhase = 'LIBRARY_APPROACH';
      const { width, height } = this.scene.scale;
      const groundY = getGroundY(height);
      this.libraryBuilding = new LibraryBuilding(this.scene, width + 400, groundY);
      this.scene.add.existing(this.libraryBuilding);
      this.scene.showNoorMessage("انظر! بيت الحكمة! 🏛️", false, 'greet');
      return true;
  }

  private triggerLibraryArrival() {
      this.eventPhase = 'LIBRARY_ENTRY';
      this.scene.setGameSpeed(0);
      const doorX = (this.libraryBuilding && this.libraryBuilding.active) ? this.libraryBuilding.x : this.scene.scale.width / 2;
      this.scene.player.isScripted = true;
      this.scene.player.stopStruggle();
      this.scene.player.play('run'); 

      this.scene.tweens.add({
          targets: this.scene.player,
          x: doorX,
          duration: 1500,
          ease: 'Power1',
          onComplete: () => {
              this.scene.tweens.add({
                  targets: this.scene.player,
                  alpha: 0,
                  scale: 0.9,
                  duration: 500,
                  onComplete: () => this.startLibraryTransitionSequence()
              });
          }
      });
  }

  private startLibraryTransitionSequence() {
      this.scene.cameras.main.fadeOut(1000, 0, 0, 0);
      this.scene.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.environmentManager.transitionToLibrary();
          if (this.libraryBuilding) {
              this.libraryBuilding.destroy();
              this.libraryBuilding = null;
          }
          this.scene.time.delayedCall(1500, () => {
              this.scene.cameras.main.fadeIn(1000);
              this.scene.player.alpha = 1;
              this.scene.player.setScale(1);
              this.scene.player.x = getPlayerStartX(this.scene.scale.width);
              this.scene.player.play('run');
              this.scene.cameras.main.once('camerafadeincomplete', () => {
                  this.scene.player.isScripted = false;
                  this.scene.setGameSpeed(0);
                  this.scene.showStageTitle('بيت الحكمة', 2500, () => {
                      this.scene.showNoorMessage('أهلاً بك في بيت الحكمة… هنا نهاية الرحلة وبداية العلم. 📚', false, 'greet');
                      // 3–5 short puzzles in sequence (placeholder; replace with your puzzles later)
                      this.libraryPuzzleQueue = [
                          { type: 'LIBRARY', prompt: 'أيُّ هذه الرموز يعبِّر أكثر عن بيت الحكمة؟', options: ['📚', '⚔️', '🏹'], correctIndex: 0, timeoutMs: 8000 },
                          { type: 'LIBRARY', prompt: 'ما الذي يرمز إلى العلم؟', options: ['📖', '🗡️', '🛡️'], correctIndex: 0, timeoutMs: 8000 },
                          { type: 'LIBRARY', prompt: 'اختر الرمز الذي يمثّل الحكمة.', options: ['🦉', '🐺', '🦅'], correctIndex: 0, timeoutMs: 8000 },
                          { type: 'LIBRARY', prompt: 'أيُّ لون يُذكّر بالمعرفة والذهب؟', options: ['🟡', '🔴', '🔵'], correctIndex: 0, timeoutMs: 8000 }
                      ];
                      this.libraryPuzzleIndex = 0;
                      this.libraryPuzzleSequenceActive = true;
                      this.scene.time.delayedCall(2000, () => {
                          this.scene.showPuzzle(this.libraryPuzzleQueue[0]);
                      });
                  });
              });
          });
      });
  }

  /** After library intro (title + Noor): resume running; game ends when city distance reaches STAGE_2_LENGTH_M. */
  private resumeRunInLibrary() {
      this.scene.hideNoorMessage();
      this.eventPhase = 'NONE';
      this.isEncounterActive = false;
      this.encounterType = 'NONE';
      this.scene.player.isScripted = false;
      this.scene.setGameSpeed(1.0);
      this.scene.player.play('run');
  }

  // --- SANDSTORM LOGIC ---
  private triggerSandstorm() {
      this.eventPhase = 'SANDSTORM_ONSET';
      this.sandstormTimer = 0;
      this.scene.startSandstorm();
  }

  private triggerSandstormDiscovery() {
      this.eventPhase = 'SANDSTORM_APPROACH';
      const { width, height } = this.scene.scale;
      const groundY = getGroundY(height);
      this.refugeTent = new BedouinTent(this.scene, width + 400, groundY);
      this.refugeTent.setDepth(15);
      this.scene.add.existing(this.refugeTent);
      this.scene.showNoorMessage("انظر! خيمة بدوية! لنحتمي بها! ⛺", false, 'greet');
  }

  private triggerSandstormArrival() {
      this.eventPhase = 'SANDSTORM_SHELTER';
      this.scene.setGameSpeed(0); 
      this.scene.player.stopStruggle();
      this.scene.player.isScripted = true; 
      const tentX = (this.refugeTent && this.refugeTent.active) ? this.refugeTent.x : this.scene.scale.width / 2;
      
      this.scene.tweens.add({
          targets: this.scene.player,
          x: tentX,
          duration: 1000,
          ease: 'Power1',
          onComplete: () => {
              this.scene.tweens.add({
                  targets: this.scene.player,
                  alpha: 0,
                  scale: 0.8,
                  duration: 500,
                  onComplete: () => {
                      this.startShelterInteraction();
                  }
              });
          }
      });
  }

  private startShelterInteraction() {
      if (this.refugeTent && this.refugeTent.active) this.refugeTent.setOccupied(true);
      this.scene.showNoorMessage("الحمد لله! نحن في أمان هنا. 🏕️", false, 'success');
      this.scene.replenishHealth();
      // 3–5 short puzzles in sequence (placeholder content; replace with your puzzles later)
      this.stormPuzzleQueue = [
          { type: 'STORM', prompt: 'انظر إلى النمط: ★ ☆ ★ ☆ ؟ ما الرمز التالي؟', options: ['★', '☆', '⚪️'], correctIndex: 0, timeoutMs: 7000 },
          { type: 'STORM', prompt: 'ما الشكل الذي يكمل التسلسل؟ ◯ □ ◯ □ ؟', options: ['◯', '□', '△'], correctIndex: 0, timeoutMs: 7000 },
          { type: 'STORM', prompt: 'اختر الرمز الذي يمثّل المعرفة.', options: ['📚', '⚔️', '🏹'], correctIndex: 0, timeoutMs: 7000 },
          { type: 'STORM', prompt: 'أيُّ لون يُذكّر بالصحراء؟', options: ['🟡', '🔵', '🟢'], correctIndex: 0, timeoutMs: 7000 }
      ];
      this.stormPuzzleIndex = 0;
      this.scene.time.delayedCall(1500, () => {
          this.scene.showPuzzle(this.stormPuzzleQueue[0]);
      });
  }

  /** Called by MainScene after any puzzle is resolved; advances storm/library sequence or no-op. */
  public reportPuzzleResolved(isCorrect: boolean) {
      if (this.stormPuzzleQueue.length > 0 && this.eventPhase === 'SANDSTORM_SHELTER') {
          this.stormPuzzleIndex++;
          if (this.stormPuzzleIndex < this.stormPuzzleQueue.length) {
              this.scene.time.delayedCall(600, () => {
                  this.scene.showPuzzle(this.stormPuzzleQueue[this.stormPuzzleIndex]);
              });
          } else {
              this.stormPuzzleQueue = [];
              this.stormPuzzleIndex = 0;
              this.triggerCutscene();
          }
          return;
      }
      if (this.libraryPuzzleQueue.length > 0 && this.libraryPuzzleSequenceActive) {
          this.libraryPuzzleIndex++;
          if (this.libraryPuzzleIndex < this.libraryPuzzleQueue.length) {
              this.scene.time.delayedCall(600, () => {
                  this.scene.showPuzzle(this.libraryPuzzleQueue[this.libraryPuzzleIndex]);
              });
          } else {
              this.libraryPuzzleQueue = [];
              this.libraryPuzzleIndex = 0;
              this.libraryPuzzleSequenceActive = false;
              this.resumeRunInLibrary();
          }
      }
  }

  private triggerCutscene() {
      this.scene.cameras.main.fadeOut(1000, 0, 0, 0);
      this.scene.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.time.delayedCall(2000, () => {
              this.endShelterSequence();
          });
      });
  }

  private endShelterSequence() {
      this.scene.endSandstorm(); 
      this.scene.cameras.main.fadeIn(1000);
      if (this.refugeTent && this.refugeTent.active) this.refugeTent.setOccupied(false);
      this.scene.cameras.main.once('camerafadeincomplete', () => {
          this.scene.tweens.add({ targets: this.scene.player, alpha: 1, scale: 1, duration: 500 });
          this.scene.time.delayedCall(500, () => {
              // Storm over – revert to simple thankful line
              this.scene.showNoorMessage("الحمد لله! انتهت العاصفة الرملية.", false, 'success');
              this.scene.time.delayedCall(4500, () => {
                  this.scene.hideNoorMessage();
                  this.resumeRunFromShelter();
              });
          });
      });
  }

  private resumeRunFromShelter() {
      this.scene.audioManager?.fadeBGMUp();
      this.scene.clearQuestionAndResumePhysics();
      this.scene.player.isScripted = false;
      this.scene.player.stopStruggle();
      this.scene.player.play('run');
      this.scene.setGameSpeed(1.0);
      if (this.scene.physics.world.isPaused) this.scene.physics.resume();
      this.scene.player.anims.resume();
      this.scene.tweens.add({ targets: this.scene.player, x: getPlayerStartX(this.scene.scale.width), duration: 2000, ease: 'Power2.inOut' });
      this.eventPhase = 'NONE';
      this.encounterType = 'NONE';
      this.isEncounterActive = false;
  }

  /** Remove gate/chest when sandstorm starts (elements are removed, not hidden). */
  public removeEncounterObjects(): void {
      if (this.currentGate?.active) {
          this.currentGate.destroy();
          this.currentGate = null;
      }
      if (this.currentChest?.active) {
          this.currentChest.destroy();
          this.currentChest = null;
      }
  }

  // --- CHEST LOGIC ---
  private calculateNextChestDistance(nextGateTarget: number) {
      const runDistance = this.scene.getRunDistance();
      const distRemaining = nextGateTarget - runDistance;
      const midPoint = runDistance + (distRemaining / 2);
      this.nextChestDistance = midPoint;
      this.hasSpawnedChestSegment = false;
  }

  private checkChestThreshold() {
      if (!this.hasSpawnedChestSegment && this.scene.getRunDistance() >= this.nextChestDistance && this.queuedEncounter === 'NONE') {
          this.hasSpawnedChestSegment = true;
          this.queuedEncounter = 'CHEST';
          this.nextChestDistance = this.scene.getRunDistance() + this.CHEST_INTERVAL_M;
      }
  }

  public processQueuedEncounter(x: number, groundY: number): boolean {
      // Allow processing chests in desert (INTRO_RUN) and normal run (NONE) so spawns are never blocked
      if (this.eventPhase !== 'NONE' && this.eventPhase !== 'INTRO_RUN') return false;

      if (this.queuedEncounter === 'CHEST') {
          this.spawnChestPattern(x, groundY);
          this.queuedEncounter = 'NONE';
          this.scene.spawnManager.nextSpawnTime = 3000;
          return true;
      }
      return false;
  }

  private spawnChestPattern(x: number, groundY: number) {
      this.isEncounterActive = true;
      this.encounterType = 'CHEST';
      this.isEncounterOpening = false;
      this.scene.playSfx('eventAppear');
      const onPlatform = Math.random() > 0.4;
      if (onPlatform) {
          const platY = groundY - 100;
          this.scene.environmentManager.platform.spawnFloatingPlatform(x + 300, platY, 2.0); 
          this.currentChest = new MagicChest(this.scene, x + 300, platY - 50, true);
      } else {
          this.currentChest = new MagicChest(this.scene, x + 300, groundY - 25, true);
          this.scene.spawnManager.obstacles.add(new Obstacle(this.scene, x + 100, groundY, 'rock'));
      }
  }

  public handleEncounterPause(playerX: number) {
      if (!this.isEncounterActive) return;
      if (this.eventPhase === 'LEVEL_END_APPROACH') return; 
      if (this.eventPhase === 'CARPET_RIDE') return; 

      let stopDistance = 300; 
      if (this.encounterType === 'CHEST') stopDistance = 220;

      const stopX = playerX + stopDistance;
      let objectX = 0;
      if (this.encounterType === 'CHEST' && this.currentChest && this.currentChest.active) objectX = this.currentChest.x;

      if (objectX <= stopX && !this.isEncounterOpening) {
          if (this.encounterType === 'CHEST') {
              this.scene.pauseGameplayForQuestion();
          }
      }
  }

  public reset() {
      this.eventPhase = 'NUR_INTRO'; 
      this.introTimer = 0;
      this.encounterType = 'NONE';
      this.queuedEncounter = 'NONE';
      this.isEncounterActive = false;
      this.isEncounterOpening = false;
      this.sandstormTriggered = false; 
      this.sandstormTimer = 0;
      this.libraryBuilding = null;
      this.libraryStartDistance = 0;
      this.libraryEventTriggered = false;
      this.levelEndTriggered = false;
      this.hasTransitionedToCity = false;
      this.hasTriggeredRooftopTutorial = false;
      
      // Reset Carpet Logic
      this.carpetMissed = false;
      this.nextCarpetSpawnPos = 0;
      this.carpetTimer = 0;
      
      if (this.refugeTent) { this.refugeTent.destroy(); this.refugeTent = null; }
      if (this.currentGate) { this.currentGate.destroy(); this.currentGate = null; }
      if (this.currentChest) { this.currentChest.destroy(); this.currentChest = null; }
      if (this.currentCarpet) { this.currentCarpet.destroy(); this.currentCarpet = null; }
      
      this.calculateNextChestDistance(150);
      
      this.scene.player.isReaching = false;
      this.scene.player.stopStruggle();
      this.scene.player.isScripted = false;
      this.scene.player.stopFlying(); 
      this.scene.triggerDebris(false);
      this.scene.triggerSandstormEffects(false);

      if (this.scene.getCurrentStage() >= 2) {
          this.scene.player.setVariableJump(true);
      }
  }
}
