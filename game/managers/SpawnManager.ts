
import Phaser from 'phaser';
import { MainScene } from '../scenes/MainScene';
import { Star } from '../objects/Star';
import { Heart } from '../objects/Heart';
import { ShieldItem } from '../objects/ShieldItem';
import { Obstacle } from '../objects/Obstacle';
import { MerchantCart } from '../objects/MerchantCart';
import { StackOfRugs } from '../objects/StackOfRugs';
import { MarketAwning } from '../objects/MarketAwning';
import { CityBuilding } from '../objects/CityBuilding';
import { StreetCat } from '../objects/StreetCat'; // Import Cat
import { PHYSICS } from '../../constants';

export class SpawnManager {
  private scene: MainScene;
  
  public stars!: Phaser.GameObjects.Group;
  public heartsGroup!: Phaser.GameObjects.Group;
  public shieldsGroup!: Phaser.GameObjects.Group;
  public obstacles!: Phaser.GameObjects.Group;
  public merchantCarts!: Phaser.GameObjects.Group;
  public rugStacks!: Phaser.GameObjects.Group;
  public marketAwnings!: Phaser.GameObjects.Group; 
  public cats!: Phaser.GameObjects.Group;

  private spawnTimer: number = 0;
  public nextSpawnTime: number = 100; 
  
  private distanceSinceLastHeart: number = 0;
  private distanceSinceLastShield: number = 0;
  private readonly HEART_SPAWN_DISTANCE = 1200;
  private readonly SHIELD_SPAWN_DISTANCE = 1500;
  
  private spawnCount: number = 0;
  
  // Logic Control
  private lastSpawnType: string = 'NONE';
  private spawnQueue: { type: string, delay: number, yOffset?: number }[] = [];

  constructor(scene: MainScene) {
    this.scene = scene;
  }

  public create() {
    this.stars = this.scene.add.group({ classType: Star, runChildUpdate: false });
    this.heartsGroup = this.scene.add.group({ classType: Heart, runChildUpdate: false });
    this.shieldsGroup = this.scene.add.group({ classType: ShieldItem, runChildUpdate: false });
    this.obstacles = this.scene.add.group({ classType: Obstacle, runChildUpdate: false });
    this.merchantCarts = this.scene.add.group({ classType: MerchantCart, runChildUpdate: false });
    this.rugStacks = this.scene.add.group({ classType: StackOfRugs, runChildUpdate: false });
    this.marketAwnings = this.scene.add.group({ classType: MarketAwning, runChildUpdate: false }); 
    this.cats = this.scene.add.group({ classType: StreetCat, runChildUpdate: false });
    
    MarketAwning.generateTextures(this.scene);
    StreetCat.generateTexture(this.scene);
  }

  public update(delta: number, frameMove: number, currentSpeed: number) {
    const updateGroup = (group: Phaser.GameObjects.Group) => {
        group.children.each((child: any) => {
            if (child && child.active && typeof child.update === 'function') {
                if (child instanceof StreetCat) {
                    child.update(this.scene.player.x, frameMove);
                } else {
                    child.update(frameMove);
                }
            }
            return true;
        });
    };

    updateGroup(this.stars);
    updateGroup(this.heartsGroup);
    updateGroup(this.shieldsGroup);
    updateGroup(this.obstacles);
    updateGroup(this.merchantCarts);
    updateGroup(this.rugStacks);
    updateGroup(this.marketAwnings);
    updateGroup(this.cats);

    this.distanceSinceLastHeart += frameMove * 0.05;
    this.distanceSinceLastShield += frameMove * 0.05;

    if (this.distanceSinceLastHeart >= this.HEART_SPAWN_DISTANCE) {
        this.distanceSinceLastHeart = 0;
        const hY = this.scene.scale.height - Phaser.Math.Between(150, 400);
        this.heartsGroup.add(new Heart(this.scene, this.scene.scale.width + 100, hY));
    }
    if (this.distanceSinceLastShield >= this.SHIELD_SPAWN_DISTANCE) {
        this.distanceSinceLastShield = 0;
        const sY = this.scene.scale.height - Phaser.Math.Between(150, 400);
        this.shieldsGroup.add(new ShieldItem(this.scene, this.scene.scale.width + 100, sY));
    }

    // Desert (INTRO_RUN): show obstacles, stars, boxes etc. from the very start of the run
    const runDistance = this.scene.getRunDistance();
    const evt = this.scene.eventManager;
    const isDesertRun = evt.eventPhase === 'INTRO_RUN' && runDistance >= 0;
    const spawningAllowed = evt.isSpawningAllowed();

    if (isDesertRun || spawningAllowed) {
        this.spawnTimer += delta;
        if (this.spawnTimer > this.nextSpawnTime) {
            this.spawnTimer = 0;
            this.spawnPattern(currentSpeed);
        }
    }
  }

  private spawnPattern(currentSpeed: number) {
      const x = this.scene.scale.width + 100;
      const groundY = this.scene.scale.height - 128;

      if (this.scene.eventManager.processQueuedEncounter(x, groundY)) {
          return; 
      }

      // --- 1. QUEUE SYSTEM (For structured sequences) ---
      if (this.spawnQueue.length > 0) {
          const next = this.spawnQueue.shift();
          if (next) {
              const y = next.yOffset ? groundY + next.yOffset : groundY;
              this.spawnSpecific(next.type, x, y);
              this.nextSpawnTime = next.delay;
              return;
          }
      }

      // --- 2. FLYING PHASE PATTERNS ---
      if (this.scene.eventManager.eventPhase === 'CARPET_RIDE') {
          this.spawnFlightCollectibles(x, this.scene.scale.height);
          this.nextSpawnTime = 1500; // Keep flow steady but give room to fly
          return;
      }

      // --- 3. TUTORIAL SEQUENCE ---
      if (this.spawnCount === 0) {
          this.spawnSpecific('SINGLE_ROCK', x, groundY);
          this.scene.firstObstacleRef = this.obstacles.getLast(true);
          this.nextSpawnTime = 1200; 
          this.spawnCount++;
          return;
      }
      if (this.spawnCount === 1) {
          this.spawnSpecific('SINGLE_CACTUS', x, groundY);
          this.nextSpawnTime = 2000;
          this.spawnCount++;
          return;
      }

      // --- 4. RANDOM PATTERN GENERATION ---
      this.spawnRandomObstacle(x, groundY, currentSpeed);
  }

  private spawnFlightCollectibles(x: number, screenH: number) {
      const type = Phaser.Math.Between(0, 4);
      const midY = screenH / 2;
      const safeH = screenH - 100;
      
      if (type === 0) {
          // --- WAVE PATH ---
          // A nice curve of stars to swoop through
          const startY = Phaser.Math.Between(200, safeH - 200);
          const dir = Math.random() > 0.5 ? 1 : -1; 
          for(let i=0; i<8; i++) {
              const sx = x + (i * 60);
              const sy = startY + (Math.sin(i * 0.5) * 120 * dir);
              this.addStar(sx, Phaser.Math.Clamp(sy, 50, safeH));
          }
      } 
      else if (type === 1) {
          // --- DOUBLE STAR LINES ---
          const y1 = midY - 150;
          const y2 = midY + 150;
          for(let i=0; i<5; i++) {
              this.addStar(x + (i*80), y1);
              this.addStar(x + (i*80), y2);
          }
      }
      else if (type === 2) {
          // --- ZIG ZAG (Slalom) ---
          const startY = midY;
          for(let i=0; i<6; i++) {
              const sx = x + (i * 100);
              const sy = midY + ((i % 2 === 0 ? -1 : 1) * 200);
              this.addStar(sx, sy);
              // Add a "turn marker" orb at the peaks
              if (i > 0 && i < 5) {
                  this.obstacles.add(new Obstacle(this.scene, sx, sy + 50, 'orb'));
              }
          }
      }
      else if (type === 3) {
          // --- RING WITH HEART ---
          const cy = midY;
          const radius = 120;
          // Circle of stars
          for(let i=0; i<8; i++) {
              const angle = (i/8) * Math.PI * 2;
              const sx = x + Math.cos(angle) * radius;
              const sy = cy + Math.sin(angle) * radius;
              this.addStar(sx, sy);
          }
          // Heart in center
          this.heartsGroup.add(new Heart(this.scene, x, cy));
      }
      else {
          // --- VERTICAL STACK (Ascent Challenge) ---
          // Line going straight up
          for(let i=0; i<6; i++) {
              this.addStar(x + (i*20), safeH - (i * 100));
          }
          // Shield at top
          this.shieldsGroup.add(new ShieldItem(this.scene, x + 120, safeH - 650));
      }
  }

  public queueRooftopRun() {
      // Pushes a structured sequence to the queue
      this.spawnQueue.push({ type: 'STACK_OF_RUGS', delay: 1000 }); // Step up
      this.spawnQueue.push({ type: 'AWNING_LOW', delay: 1200, yOffset: -80 }); // First bounce
      this.spawnQueue.push({ type: 'AWNING_HIGH', delay: 1500, yOffset: -180 }); // Second bounce
      this.spawnQueue.push({ type: 'FLOATING_PLATFORM_HIGH', delay: 2000 }); // Landing
      this.spawnQueue.push({ type: 'FREE_STARS', delay: 1000, yOffset: -250 }); // Reward
  }

  private applyAerialSpawn(pattern: string, x: number, screenH: number) {
      this.spawnFlightCollectibles(x, screenH);
  }

  private spawnSpecific(pattern: string, x: number, groundY: number) {
      this.applySpawnLogic(pattern, x, groundY);
  }

  private spawnRandomObstacle(x: number, groundY: number, currentSpeed: number) {
      let patterns: string[] = [];
      const zone = this.scene.environmentManager.getZone();
      const currentStage = this.scene.getCurrentStage();

      // Ensure we don't spawn impossible combinations
      // e.g. If last was GAP, don't spawn TALL OBSTACLE immediately
      
      const isShopHere = this.scene.environmentManager.roadside.isShopNear(x, 300);

      if (isShopHere) {
          patterns = ['FREE_STARS', 'STREET_CAT'];
      } else {
          if (zone === 'LIBRARY') {
              patterns = [
                  'BOOK_PILE', 'FLOATING_BOOKS_PATH', 'LIBRARY_SCROLLS', 'BOOK_JUMP', 'FREE_STARS'
              ];
          } else if (zone === 'DESERT' || zone === 'TRANSITION') {
              patterns = [
                  'SINGLE_ROCK', 'SINGLE_CACTUS', 'SPIKE_TRAP', 'FREE_STARS', 
                  'SNAKE_SOLO', 'FALCON', 'PLATFORM_SIMPLE_HOP', 'CRUMBLING_ARCH',
                  'SCORPION_HUNT', 'VIPER_NEST', 'ARFAJ_PATCH'
              ];
          } else {
              // CITY PATTERNS
              if (currentStage === 2) {
                  // STAGE 2: Organized, Verticality, "Flow"
                  patterns = [
                      'MERCHANT_CART', 'STACK_OF_RUGS', 'ROOFTOP_START', // Trigger sequence
                      'PLATFORM_SIMPLE_HOP', 'FREE_STARS', 'STREET_CAT',
                      'PLATFORM_MINI_STAIRS'
                  ];
              } else {
                  // HARDER CITY
                  patterns = [
                     'SINGLE_ROCK', 'MERCHANT_CART', 'STACK_OF_RUGS', 'ROOFTOP_START', 'SPIKE_TRAP', 
                     'PLATFORM_SIMPLE_HOP', 'PLATFORM_MINI_STAIRS', 'FREE_STARS', 
                     'SPLIT_PATH_CAVE', 'SHOP_DROP_BOUNCE', 'PLATFORM_BRIDGE',
                     'SCORPION_HUNT', 'ARFAJ_PATCH', 'STREET_CAT'
                  ];
              }
          }
      }

      // IMPOSSIBLE JUMP FILTER
      if (this.lastSpawnType === 'GAP' || this.lastSpawnType === 'SPLIT_PATH_CAVE') {
          // Remove tall obstacles that are hard to jump over after a gap
          patterns = patterns.filter(p => p !== 'CRUMBLING_ARCH' && p !== 'ROOFTOP_START');
      }

      const pattern = Phaser.Utils.Array.GetRandom(patterns);
      
      // If we picked ROOFTOP_START, switch to queue mode
      if (pattern === 'ROOFTOP_START') {
          this.queueRooftopRun();
          this.scene.eventManager.triggerRooftopTutorial(); // Noor helps
          // We don't spawn immediately, the queue will pick it up next frame
          this.nextSpawnTime = 100;
          this.lastSpawnType = 'ROOFTOP_SEQUENCE';
          return;
      }

      const baseDelay = this.applySpawnLogic(pattern, x, groundY);
      this.lastSpawnType = pattern;
      
      // Difficulty Scaling: Faster spawns in later stages
      const difficultyMod = Math.max(0.6, 1.0 - ((currentStage - 1) * 0.15));
      this.nextSpawnTime = (baseDelay * difficultyMod) + Phaser.Math.Between(-200, 300);
  }

  private applySpawnLogic(pattern: string, x: number, groundY: number): number {
      const platform = this.scene.environmentManager.platform;
      let baseDelay = 2000;

      switch(pattern) {
          // --- HELPERS ---
          case 'STREET_CAT':
              this.cats.add(new StreetCat(this.scene, x, groundY));
              baseDelay = 1500;
              break;

          // --- ROOFTOP COMPONENTS ---
          case 'AWNING_LOW':
              this.marketAwnings.add(new MarketAwning(this.scene, x, groundY, 'RED'));
              this.addStar(x, groundY - 50);
              baseDelay = 1000;
              break;
          case 'AWNING_HIGH':
              this.marketAwnings.add(new MarketAwning(this.scene, x, groundY, 'BLUE'));
              this.addStar(x, groundY - 60);
              baseDelay = 1000;
              break;
          case 'FLOATING_PLATFORM_HIGH':
              platform.spawnFloatingPlatform(x, groundY - 250, 1.5);
              this.shieldsGroup.add(new ShieldItem(this.scene, x, groundY - 300));
              baseDelay = 2500;
              break;

          // --- LIBRARY PATTERNS ---
          case 'BOOK_PILE':
              this.obstacles.add(new Obstacle(this.scene, x, groundY, 'book_pile'));
              this.addStar(x, groundY - 150);
              baseDelay = 2000;
              break;
              
          case 'FLOATING_BOOKS_PATH':
              platform.spawnFloatingPlatform(x, groundY - 100, 1.0);
              platform.spawnFloatingPlatform(x + 250, groundY - 180, 1.0);
              platform.spawnFloatingPlatform(x + 500, groundY - 100, 1.0);
              this.addStar(x + 250, groundY - 240);
              baseDelay = 4000;
              break;
              
          case 'LIBRARY_SCROLLS':
              platform.spawnFloatingPlatform(x, groundY - 120, 1.5);
              this.shieldsGroup.add(new ShieldItem(this.scene, x, groundY - 170));
              this.obstacles.add(new Obstacle(this.scene, x + 250, groundY, 'book_pile'));
              baseDelay = 3000;
              break;
              
          case 'BOOK_JUMP':
              this.obstacles.add(new Obstacle(this.scene, x, groundY, 'book_pile'));
              this.obstacles.add(new Obstacle(this.scene, x + 250, groundY, 'book_pile'));
              this.addStar(x + 125, groundY - 150);
              baseDelay = 2500;
              break;

          // --- CITY / DESERT PATTERNS ---
          case 'SPLIT_PATH_CAVE':
              platform.spawnSplitLevelSequence();
              const caveStartX = x + 762;
              const shopX = caveStartX + 200; 
              
              const shop = new CityBuilding(this.scene, shopX, groundY + 10);
              shop.name = 'shop';
              this.scene.environmentManager.roadside.decorations.add(shop);
              
              const awningY = groundY - 220; 
              this.marketAwnings.add(new MarketAwning(this.scene, shopX, awningY, 'BLUE'));
              
              this.addStar(shopX, awningY - 80);
              this.addStar(shopX, awningY - 140); 

              const bounceLandingX = shopX + 400; 
              this.shieldsGroup.add(new ShieldItem(this.scene, bounceLandingX, groundY - 350));
              this.addStar(bounceLandingX + 250, groundY - 350);
              
              this.obstacles.add(new Obstacle(this.scene, caveStartX + 600, groundY, 'snake'));
              this.obstacles.add(new Obstacle(this.scene, caveStartX + 1200, groundY, 'spikes'));
              
              baseDelay = 8000; 
              break;

          case 'SHOP_DROP_BOUNCE':
              this.obstacles.add(new Obstacle(this.scene, x + 50, groundY, 'spikes'));
              const gapWidth = 700;
              platform.spawnShopGap(x + 200, gapWidth);

              const pitY = groundY + 50; 
              const pitX = x + 200 + 350; 
              platform.spawnFloatingPlatform(pitX, pitY, 2.5);
              
              const pitShop = new CityBuilding(this.scene, pitX, pitY + 10);
              pitShop.setDepth(11); 
              this.scene.environmentManager.roadside.decorations.add(pitShop);
              
              const pitAwningY = pitY - 210;
              this.marketAwnings.add(new MarketAwning(this.scene, pitX, pitAwningY, 'BLUE'));
              
              const highPlatX = pitX + 400;
              const highPlatY = groundY - 350; 
              platform.spawnFloatingPlatform(highPlatX, highPlatY, 1.2);
              
              this.addStar(pitX, pitAwningY - 80);
              this.addStar(pitX, pitAwningY - 150);
              this.addStar(highPlatX, highPlatY - 60);
              this.shieldsGroup.add(new ShieldItem(this.scene, highPlatX, highPlatY - 60));

              baseDelay = 5000;
              break;

          case 'MERCHANT_CART':
              this.merchantCarts.add(new MerchantCart(this.scene, x, groundY));
              // Optimized star arc
              this.addStar(x - 50, groundY - 140);
              this.addStar(x, groundY - 160);
              this.addStar(x + 50, groundY - 140);
              baseDelay = 2200;
              break;
              
          case 'STACK_OF_RUGS':
              this.rugStacks.add(new StackOfRugs(this.scene, x, groundY));
              this.addStar(x - 60, groundY - 120);
              this.addStar(x, groundY - 160);
              this.addStar(x + 60, groundY - 120);
              baseDelay = 2200;
              break;

          case 'ROOFTOP_PATH':
              const awning1Y = groundY - 100;
              this.marketAwnings.add(new MarketAwning(this.scene, x, awning1Y, 'GREEN'));
              this.addStar(x, awning1Y - 60);

              const awning2X = x + 350;
              const awning2Y = groundY - 140;
              this.marketAwnings.add(new MarketAwning(this.scene, awning2X, awning2Y, 'BLUE'));
              
              this.addStar(x + 175, awning1Y - 120);
              this.addStar(awning2X, awning2Y - 60);

              const platX = awning2X + 350;
              const platY = groundY - 280; 
              platform.spawnFloatingPlatform(platX, platY, 1.5);
              
              this.shieldsGroup.add(new ShieldItem(this.scene, platX, platY - 50));
              this.addStar(platX - 60, platY - 50);
              this.addStar(platX + 60, platY - 50);
              
              this.obstacles.add(new Obstacle(this.scene, x + 200, groundY, 'spikes'));
              this.merchantCarts.add(new MerchantCart(this.scene, x + 500, groundY));

              baseDelay = 4500;
              break;

          case 'CRUMBLING_ARCH':
              this.obstacles.add(new Obstacle(this.scene, x, groundY, 'archway'));
              this.addStar(x, groundY - 220); 
              baseDelay = 2000;
              break;

          case 'SCORPION_HUNT':
              this.obstacles.add(new Obstacle(this.scene, x, groundY, 'scorpion'));
              this.obstacles.add(new Obstacle(this.scene, x + 350, groundY, 'scorpion'));
              this.addStar(x + 175, groundY - 160);
              baseDelay = 2000;
              break;

          case 'VIPER_NEST':
              this.obstacles.add(new Obstacle(this.scene, x, groundY, 'viper'));
              this.obstacles.add(new Obstacle(this.scene, x + 120, groundY, 'viper'));
              this.addStar(x + 60, groundY - 180);
              baseDelay = 2200;
              break;

          case 'ARFAJ_PATCH':
              this.obstacles.add(new Obstacle(this.scene, x, groundY, 'arfaj'));
              this.addStar(x, groundY - 160);
              baseDelay = 1500;
              break;

          case 'SINGLE_ROCK':
              this.obstacles.add(new Obstacle(this.scene, x, groundY, 'rock'));
              this.addStar(x, groundY - 150);
              baseDelay = 1500;
              break;
          case 'SINGLE_CACTUS':
              this.obstacles.add(new Obstacle(this.scene, x, groundY, 'cactus'));
              this.addStar(x, groundY - 150);
              baseDelay = 1500;
              break;
          case 'SPIKE_TRAP':
               this.obstacles.add(new Obstacle(this.scene, x, groundY, 'spikes'));
               this.addStar(x, groundY - 180);
               baseDelay = 1800;
               break;
          case 'SNAKE_SOLO':
              this.obstacles.add(new Obstacle(this.scene, x, groundY, 'snake'));
              this.addStar(x, groundY - 180);
              baseDelay = 1800;
              break;
          case 'FALCON':
               const birdY = groundY - Phaser.Math.Between(120, 180);
               this.obstacles.add(new Obstacle(this.scene, x, birdY, 'falcon'));
               baseDelay = 1800;
               break;
          case 'FREE_STARS':
              for(let i=0; i<5; i++) this.addStar(x + (i*60), groundY - 120 - (Math.sin(i)*40));
              baseDelay = 1800;
              break;
          case 'PLATFORM_SIMPLE_HOP':
              this.obstacles.add(new Obstacle(this.scene, x + 80, groundY, 'spikes'));
              platform.spawnFloatingPlatform(x, groundY - 90, 1.5);
              this.addStar(x, groundY - 150);
              baseDelay = 2500;
              break;
          case 'PLATFORM_MINI_STAIRS':
              platform.spawnFloatingPlatform(x, groundY - 80, 1.5);
              platform.spawnFloatingPlatform(x + 300, groundY - 160, 1.5);
              this.addStar(x + 300, groundY - 220);
              baseDelay = 3000;
              break;
          case 'PLATFORM_BRIDGE':
              platform.spawnFloatingPlatform(x, groundY - 120, 1.5);
              platform.spawnFloatingPlatform(x + 240, groundY - 120, 1.5);
              platform.spawnFloatingPlatform(x + 480, groundY - 120, 1.5);
              this.obstacles.add(new Obstacle(this.scene, x + 240, groundY, 'snake'));
              this.obstacles.add(new Obstacle(this.scene, x + 400, groundY, 'spikes'));
              this.addStar(x, groundY - 180);
              this.addStar(x + 240, groundY - 180);
              this.addStar(x + 480, groundY - 180);
              baseDelay = 4000;
              break;
      }
      return baseDelay;
  }

  private addStar(x: number, y: number) {
      this.stars.add(new Star(this.scene, x, y));
  }

  public reset() {
      this.spawnTimer = 0;
      this.nextSpawnTime = 100;
      this.distanceSinceLastHeart = 0;
      this.distanceSinceLastShield = 0;
      this.spawnCount = 0;
      this.spawnQueue = [];
      this.lastSpawnType = 'NONE';
      
      this.stars.clear(true, true);
      this.heartsGroup.clear(true, true);
      this.shieldsGroup.clear(true, true);
      this.obstacles.clear(true, true);
      this.merchantCarts.clear(true, true);
      this.rugStacks.clear(true, true);
      this.marketAwnings.clear(true, true);
      this.cats.clear(true, true);
  }
}
