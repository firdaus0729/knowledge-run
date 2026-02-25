
import Phaser from 'phaser';
import { CityBuilding } from './CityBuilding';
import { CityPalm } from './CityPalm';
import { CityLamp } from './CityLamp';
import { CityFountain } from './CityFountain';
import { RoadsideRuin } from './RoadsideRuin';
import { BedouinTent } from './BedouinTent';
import { AncientWell } from './AncientWell';
import { LibraryDecor, DecorType } from './LibraryDecor';
import { MainScene } from '../scenes/MainScene';

export class RoadsideArchitecture {
  private scene: MainScene;
  
  public decorations: Phaser.GameObjects.Group;
  public fountains: Phaser.GameObjects.Group;
  
  private width: number;
  private height: number;

  // Timers
  private shopTimer: number = 0;
  private pendingShops: number = 0; 
  private shopCooldown: number = 0; 

  private fountainTimer: number = 0;
  private nextFountainTime: number = 0;

  private palmTimer: number = 0;
  private nextPalmTime: number = 0;

  private lampTimer: number = 0;
  private nextLampTime: number = 0;

  private ruinTimer: number = 0;
  private nextRuinTime: number = 0;

  private tentTimer: number = 0;
  private nextTentTime: number = 0;

  private wellTimer: number = 0;
  private nextWellTime: number = 0;

  // Library Timer
  private libraryTimer: number = 0;
  private nextLibraryTime: number = 2000;

  constructor(scene: MainScene) {
    this.scene = scene;
    this.width = scene.scale.width;
    this.height = scene.scale.height;
    
    this.decorations = scene.add.group({ runChildUpdate: false });
    this.fountains = scene.add.group({ runChildUpdate: false });

    this.generateTextures();
    
    this.nextFountainTime = Phaser.Math.Between(23000, 30000);
    this.nextPalmTime = Phaser.Math.Between(5000, 10000);
    this.nextLampTime = 2000;
    this.nextRuinTime = Phaser.Math.Between(8000, 15000);
    this.nextTentTime = Phaser.Math.Between(5000, 12000);
    this.nextWellTime = Phaser.Math.Between(15000, 30000); 
  }

  public resize(width: number, height: number) {
      this.width = width;
      this.height = height;
  }

  public update(dt: number, speed: number) {
      const moveAndKill = (item: any) => {
          item.x -= speed;
          if (item.x < -400) {
              if (item.active) item.destroy();
          }
      };

      this.decorations.children.each((child) => { moveAndKill(child); return true; });
      this.fountains.children.each((child) => { moveAndKill(child); return true; });

      if (this.scene.eventManager.eventPhase !== 'NONE') return;

      // @ts-ignore
      const zone = this.scene.environmentManager ? this.scene.environmentManager.getZone() : 'DESERT';

      if (zone === 'LIBRARY') {
          this.updateLibraryLogic(dt);
      } else if (zone === 'DESERT') {
          this.updateDesertLogic(dt);
      } else {
          // CITY & TRANSITION
          this.updateCityLogic(dt);
      }
  }

  private updateLibraryLogic(dt: number) {
      this.libraryTimer += dt;
      if (this.libraryTimer > this.nextLibraryTime) {
          this.libraryTimer = 0;
          this.nextLibraryTime = Phaser.Math.Between(3000, 6000); // Regular intervals
          this.spawnLibraryDecor();
      }
  }

  private spawnLibraryDecor() {
      const x = this.width + 150;
      if (this.isAreaClear(x, 100)) {
          const y = this.height - 110; // Floor level
          const type = Phaser.Utils.Array.GetRandom(['CANDELABRA', 'GLOBE', 'SCROLL_RACK']) as DecorType;
          
          const decor = new LibraryDecor(this.scene, x, y, type);
          this.decorations.add(decor);
      }
  }

  private updateDesertLogic(dt: number) {
      // 1. Palms (Oasis - Sparser)
      this.palmTimer += dt;
      if (this.palmTimer > this.nextPalmTime) {
          this.palmTimer = 0;
          this.nextPalmTime = Phaser.Math.Between(15000, 25000); // Rare oasis
          if (Math.random() > 0.3) {
              this.spawnPalmCluster(Phaser.Math.Between(1, 3));
          }
      }

      // 2. Ruins (Ancient)
      this.ruinTimer += dt;
      if (this.ruinTimer > this.nextRuinTime) {
          this.ruinTimer = 0;
          this.nextRuinTime = Phaser.Math.Between(10000, 20000);
          this.trySpawnRuin();
      }

      // 3. Bedouin Tents
      this.tentTimer += dt;
      if (this.tentTimer > this.nextTentTime) {
          this.tentTimer = 0;
          this.nextTentTime = Phaser.Math.Between(8000, 18000); 
          this.trySpawnTent();
      }

      // 4. Ancient Wells (Rare)
      this.wellTimer += dt;
      if (this.wellTimer > this.nextWellTime) {
          this.wellTimer = 0;
          this.nextWellTime = Phaser.Math.Between(15000, 30000);
          this.trySpawnWell();
      }
  }

  private updateCityLogic(dt: number) {
      this.shopTimer += dt;
      this.fountainTimer += dt;
      this.palmTimer += dt;
      this.lampTimer += dt;
      
      // Shops
      if (this.shopTimer > 15000) {
          this.shopTimer = 0;
          this.pendingShops = 2; 
          this.shopCooldown = 0; 
      }
      if (this.pendingShops > 0) {
          this.shopCooldown -= dt;
          if (this.shopCooldown <= 0) {
              if (this.trySpawnShop()) {
                  this.pendingShops--;
                  this.shopCooldown = 2500;
              } else {
                  this.shopCooldown = 500; 
              }
          }
      }

      // Fountains
      if (this.fountainTimer > this.nextFountainTime) {
          this.fountainTimer = 0;
          this.nextFountainTime = Phaser.Math.Between(23000, 30000);
          this.trySpawnFountain();
      }

      // Palms (Urban - More Frequent)
      if (this.palmTimer > this.nextPalmTime) {
          this.palmTimer = 0;
          this.nextPalmTime = Phaser.Math.Between(10000, 15000);
          const count = Phaser.Math.RND.weightedPick([0, 0, 1, 1, 1, 2, 2, 2, 3, 3]);
          if (count > 0) this.spawnPalmCluster(count);
      }

      // Lamps
      if (this.lampTimer > this.nextLampTime) {
          this.lampTimer = 0;
          this.nextLampTime = Phaser.Math.Between(3000, 6000);
          this.trySpawnLamp();
      }
  }

  private trySpawnShop(): boolean {
      const x = this.width + 250;
      if (this.isAreaClear(x, 180)) {
          const y = this.height - 118;
          const building = new CityBuilding(this.scene, x, y);
          building.name = 'shop'; 
          this.decorations.add(building);
          return true;
      }
      return false;
  }

  private trySpawnFountain() {
      const x = this.width + 200;
      if (this.isAreaClear(x, 150)) {
          const y = this.height - 118;
          const fountain = new CityFountain(this.scene, x, y);
          fountain.name = 'fountain';
          this.fountains.add(fountain);
      }
  }

  private trySpawnRuin() {
      const x = this.width + 150;
      if (this.isAreaClear(x, 80)) {
          const y = this.height - 118;
          const ruin = new RoadsideRuin(this.scene, x, y);
          this.decorations.add(ruin);
      }
  }

  private trySpawnTent() {
      const x = this.width + 200;
      if (this.isAreaClear(x, 120)) {
          const y = this.height - 130; 
          const tent = new BedouinTent(this.scene, x, y);
          this.decorations.add(tent);
      }
  }

  private trySpawnWell() {
      const x = this.width + 150;
      if (this.isAreaClear(x, 60)) {
          const y = this.height - 118;
          const well = new AncientWell(this.scene, x, y);
          this.decorations.add(well);
      }
  }

  private spawnPalmCluster(count: number) {
      let currentX = this.width + 150;
      const spacing = 180;
      for (let i = 0; i < count; i++) {
          currentX += (i === 0 ? 0 : spacing + Phaser.Math.Between(-30, 50));
          if (this.isAreaClear(currentX, 80)) {
              const y = this.height - 118;
              const palm = new CityPalm(this.scene, currentX, y);
              this.decorations.add(palm);
          }
      }
  }

  private trySpawnLamp() {
      const x = this.width + 100;
      if (this.isAreaClear(x, 50)) {
          const y = this.height - 118;
          const lamp = new CityLamp(this.scene, x, y);
          this.decorations.add(lamp);
      }
  }

  private isAreaClear(x: number, radius: number): boolean {
      if (this.scene.spawnManager) {
          const obstacles = [
              this.scene.spawnManager.rugStacks,
              this.scene.spawnManager.merchantCarts,
              this.scene.spawnManager.obstacles
          ];
          for (const group of obstacles) {
              const hit = group.getChildren().some((child: any) => {
                  if (!child.active) return false;
                  return Math.abs(child.x - x) < (radius + 60);
              });
              if (hit) return false;
          }
      }
      const decorHit = this.decorations.getChildren().some((child: any) => {
          if (!child.active) return false;
          return Math.abs(child.x - x) < (radius + 100);
      });
      if (decorHit) return false;
      const fountainHit = this.fountains.getChildren().some((child: any) => {
          if (!child.active) return false;
          return Math.abs(child.x - x) < (radius + 80);
      });
      if (fountainHit) return false;
      return true;
  }
  
  public isShopNear(x: number, range: number): boolean {
      return this.decorations.getChildren().some((child: any) => {
          if (!child.active) return false;
          if (child.name === 'shop') {
              if (Math.abs(child.x - x) < range) return true;
          }
          return false;
      });
  }

  public isFountainNear(x: number, range: number): boolean {
      return this.fountains.getChildren().some((child: any) => {
          if (!child.active) return false;
          if (Math.abs(child.x - x) < range) return true;
          return false;
      });
  }

  private generateTextures() {
      CityBuilding.generateTextures(this.scene);
      CityPalm.generateTexture(this.scene);
      CityLamp.generateTexture(this.scene);
      CityFountain.generateTexture(this.scene);
      RoadsideRuin.generateTexture(this.scene);
      BedouinTent.generateTexture(this.scene);
      AncientWell.generateTexture(this.scene);
  }
}
