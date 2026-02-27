
import Phaser from 'phaser';
import { MainScene } from '../scenes/MainScene';
import { MagicGate } from '../objects/MagicGate';
import { MagicChest } from '../objects/MagicChest';
import { BedouinTent } from '../objects/BedouinTent';
import { LibraryBuilding } from '../objects/LibraryBuilding';
import { MagicCarpet } from '../objects/MagicCarpet';
import { Obstacle } from '../objects/Obstacle';

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
  public libraryBuilding: LibraryBuilding | null = null;
  
  // Intro Specific
  private introTimer: number = 0;

  // Level Progression
  private readonly STAGE_1_LENGTH = 1500;
  /** Distance to run before sandstorm hits suddenly */
  private readonly SANDSTORM_TRIGGER_DISTANCE = 500; 
  private levelEndTriggered: boolean = false;
  
  // Thresholds
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

  // Carpet Logic
  private readonly CARPET_SPAWN_DIST = 1300;
  private carpetMissed: boolean = false;
  private nextCarpetSpawnPos: number = 0;
  
  // Tutorial Flags for Flow
  private hasTriggeredRooftopTutorial: boolean = false;

  constructor(scene: MainScene) {
    this.scene = scene;
    this.calculateNextChestDistance(150);
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

          // Trigger visual transition mid-flight when ground is hidden
          if (this.carpetTimer > 2000 && !this.hasTransitionedToCity) {
              this.hasTransitionedToCity = true;
              this.scene.environmentManager.transitionLibraryToCity();
          }

          // End flight after duration
          if (this.carpetTimer > 15000) {
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
              const stopX = this.scene.scale.width / 2; 
              if (this.currentGate.x <= stopX) {
                  this.currentGate.x = stopX; 
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

      // Standard checks
      if (!this.isEncounterActive && this.eventPhase === 'NONE') {
          this.checkLevelEnd(); 
          this.checkLibraryEvent();
          this.checkChestThreshold();
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
          if (!this.libraryEventTriggered && distInLibrary > this.CARPET_SPAWN_DIST) {
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
      this.nextCarpetSpawnPos = this.scene.getRunDistance() + 400; // Try again in 400m
      this.encounterType = 'NONE';
      this.scene.showNoorMessage("لقد فاتنا البساط! لا تقلق، سيظهر مرة أخرى.", false, 'greet');
  }

  private spawnMagicCarpet() {
      const spawnX = this.scene.scale.width + 400;
      const groundY = this.scene.scale.height - 150;
      
      this.currentCarpet = new MagicCarpet(this.scene, spawnX, groundY);
      this.encounterType = 'CARPET';
      this.scene.showNoorMessage("انظر! بساط الريح السحري! اقفز عليه! 🧞‍♂️", false, 'greet');
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

      // Bring ground back up to correct position
      // groundTile origin is (0,1), so y=height is correct bottom alignment
      this.scene.tweens.add({
          targets: platform.groundTile,
          y: h, 
          duration: 1000,
          ease: 'Power2.out'
      });

      // body is centered, so y=height-64 is correct for a 128px high ground
      this.scene.tweens.add({
          targets: platform.body,
          y: h - 64,
          duration: 1000,
          ease: 'Power2.out',
          onComplete: () => {
              this.scene.player.stopFlying(); // Land
              this.scene.setGameSpeed(1.0);
              // Ensure we are fully in City mode logic
              this.scene.environmentManager.finalizeCityTransition();
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
          if (distInLibrary > this.CARPET_SPAWN_DIST - 250) {
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
      const groundY = this.scene.scale.height - 128;
      this.currentGate = new MagicGate(this.scene, spawnX, groundY - 50);
      this.isEncounterActive = true;
      this.encounterType = 'GATE';
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
      this.scene.tweens.add({
          targets: player,
          x: centerX,
          y: portalCenterY,
          scale: 0.22,
          alpha: 0,
          duration: 1600,
          ease: 'Cubic.in',
          onComplete: () => {
              this.scene.showDesertStageResults();
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
      player.setPosition(100, this.scene.scale.height - 200);
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
          this.scene.showNoorMessage("مرحباً بك في مدينة العلم. 🏙️", false, 'greet'); 
          
          this.scene.time.delayedCall(4000, () => {
              this.scene.showNoorMessage("هنا، الركض وحده لا يكفي... عليك الانتباه للطرق العالية.", false, 'greet');
              
              this.scene.time.delayedCall(4500, () => {
                  this.scene.showNoorMessage("كل طريق يحمل معرفة، وكل خطوة تقربك أكثر.", false, 'greet');
                  
                  this.scene.time.delayedCall(4000, () => {
                      this.scene.hideNoorMessage();
                      this.eventPhase = 'NONE';
                      this.isEncounterActive = false;
                      this.encounterType = 'NONE';
                      
                      this.scene.setGameSpeed(1.0);
                      this.scene.player.play('run');
                  });
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

  public triggerLibraryDiscovery() {
      if (this.eventPhase !== 'NONE') return;
      this.eventPhase = 'LIBRARY_APPROACH';
      const { width, height } = this.scene.scale;
      const groundY = height - 120; 
      this.libraryBuilding = new LibraryBuilding(this.scene, width + 400, groundY);
      this.scene.add.existing(this.libraryBuilding);
      this.scene.showNoorMessage("انظر! بيت الحكمة! 🏛️", false, 'greet');
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
              this.scene.player.x = 100;
              this.scene.player.play('run');
              this.scene.cameras.main.once('camerafadeincomplete', () => {
                  this.scene.player.isScripted = false;
                  this.scene.setGameSpeed(0);
                  this.scene.showLibraryStageResults();
              });
          });
      });
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
      const groundY = height - 130; 
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
      this.scene.showNoorMessage("الحمد لله! نحن في أمان هنا. 🏕️", false, 'greet');
      this.scene.replenishHealth(); 
      this.scene.time.delayedCall(3000, () => {
          this.triggerCutscene();
      });
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
              this.scene.showNoorMessage("لا تخف... هذه المدينة مليئة بالتحديات.", false, 'greet');
              this.scene.time.delayedCall(4500, () => {
                  this.scene.showNoorMessage("سأرافقك في هذه الرحلة وأرشدك في طريق العلم.", false, 'greet');
                  this.scene.time.delayedCall(4500, () => {
                      this.scene.hideNoorMessage();
                      this.resumeRunFromShelter();
                  });
              });
          });
      });
  }

  private resumeRunFromShelter() {
      this.scene.player.isScripted = false; 
      this.scene.player.play('run');
      this.scene.setGameSpeed(1.0);
      this.scene.tweens.add({ targets: this.scene.player, x: 100, duration: 2000, ease: 'Power2.inOut' });
      this.eventPhase = 'NONE';
      this.encounterType = 'NONE';
      this.isEncounterActive = false;
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
          this.nextChestDistance = this.scene.getRunDistance() + 1500;
      }
  }

  public processQueuedEncounter(x: number, groundY: number): boolean {
      if (this.eventPhase !== 'NONE') return true; 

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
