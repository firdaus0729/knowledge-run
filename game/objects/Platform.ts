
import Phaser from 'phaser';
import { PlatformGenerator } from '../generators/PlatformGenerator';
import { CityPlatformGenerator } from '../generators/CityPlatformGenerator';
import { LibraryAssetGenerator } from '../generators/LibraryAssetGenerator';

export class Platform {
  private scene: Phaser.Scene;
  private width: number;
  private height: number;
  
  public groundTile!: Phaser.GameObjects.TileSprite;
  public body!: Phaser.GameObjects.Rectangle; 
  
  private floatingPlatforms!: Phaser.GameObjects.Group;
  private cliffSegments!: Phaser.GameObjects.Group;
  private ledgeSensorGroup!: Phaser.GameObjects.Group;
  
  private activeSequenceEnd: number = -1;
  private currentFloatingKey: string = 'floating_plat'; // Default desert

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.width = Math.max(10, Math.ceil(scene.scale.width));
    this.height = Math.max(10, Math.ceil(scene.scale.height));

    PlatformGenerator.init(scene);
    CityPlatformGenerator.init(scene);
    LibraryAssetGenerator.init(scene);
    
    this.create();
  }

  private create() {
    const groundHeight = 128;
    
    // Start with Dirt Road
    this.groundTile = this.scene.add.tileSprite(0, this.height, this.width, groundHeight, 'ground');
    this.groundTile.setOrigin(0, 1);
    this.groundTile.setDepth(0); // Ground is base level 0

    this.body = this.scene.add.rectangle(this.width / 2, this.height - 64, this.width * 2, 128, 0x000000, 0);
    this.scene.physics.add.existing(this.body, true);
    
    this.floatingPlatforms = this.scene.add.group({ runChildUpdate: false });
    this.cliffSegments = this.scene.add.group({ runChildUpdate: false });
    this.ledgeSensorGroup = this.scene.physics.add.group({ allowGravity: false, immovable: true });
  }

  public transitionTexture(newKey: string) {
      this.groundTile.setTexture(newKey);
      
      // Update floating platform style based on ground
      if (newKey.includes('city')) {
          this.currentFloatingKey = 'floating_plat_city';
      } else if (newKey.includes('library')) {
          this.currentFloatingKey = 'floating_plat_city'; 
      } else {
          this.currentFloatingKey = 'floating_plat';
      }
  }

  public resize(width: number, height: number) {
      this.width = width;
      this.height = height;

      if (this.groundTile) {
          this.groundTile.setPosition(0, height);
          this.groundTile.width = width;
      }

      if (this.body && this.body.active && this.activeSequenceEnd === -1) {
          this.body.setPosition(width / 2, height - 64);
          this.body.width = width * 2;
          const pBody = this.body.body as Phaser.Physics.Arcade.StaticBody;
          if (pBody) {
              pBody.updateFromGameObject();
          }
      }
  }

  public update(speed: number) {
      if (this.groundTile && this.groundTile.visible) {
          this.groundTile.tilePositionX += speed;
      }

      if (this.activeSequenceEnd !== -1) {
          this.activeSequenceEnd -= speed;

          if (this.activeSequenceEnd < 100) {
              this.resetToNormal();
              this.activeSequenceEnd = -1;
          }
      }

      this.floatingPlatforms.children.each((child: any) => {
          const plat = child as Phaser.Physics.Arcade.Sprite;
          if (plat) {
              plat.x -= speed;
              if (plat.x + (plat.displayWidth / 2) < -100) {
                  this.floatingPlatforms.remove(plat, true, true);
              }
          }
          return true;
      });

      this.cliffSegments.children.each((child: any) => {
          const seg = child as Phaser.GameObjects.Sprite;
          if (seg) {
              seg.x -= speed;
              if (seg.body) {
                  const b = seg.body as Phaser.Physics.Arcade.StaticBody;
                  b.updateFromGameObject();
              }
              if (seg.x + seg.width < -1000) this.cliffSegments.remove(seg, true, true);
          }
          return true;
      });
      
      this.ledgeSensorGroup.children.each((child: any) => {
          const sensor = child as Phaser.GameObjects.Rectangle;
          if(sensor) {
              sensor.x -= speed;
              const sensorBody = sensor.body as Phaser.Physics.Arcade.Body;
              if (sensorBody) {
                  sensorBody.reset(sensor.x, sensor.y);
              }
              if (sensor.x < -100) this.ledgeSensorGroup.remove(sensor, true, true);
          }
          return true;
      });
  }

  public getCollider(): Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[] {
      return this.body;
  }
  
  public getFloatingGroup(): Phaser.GameObjects.Group {
      return this.floatingPlatforms;
  }
  
  public getCliffCollider(): Phaser.GameObjects.Group {
      return this.cliffSegments; 
  }
  
  public getLedgeSensorGroup(): Phaser.GameObjects.Group {
      return this.ledgeSensorGroup;
  }
  
  public getLastLedgePosition() {
      // Removed feature
      return null;
  }

  // --- SPAWN PATTERNS ---

  public spawnFloatingPlatform(x: number, y: number, widthScale: number = 1) {
      const plat = this.scene.physics.add.sprite(x, y, this.currentFloatingKey);
      plat.setImmovable(true);
      (plat.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
      plat.setScale(widthScale, 1);
      plat.body.setSize(plat.width, 20); 
      plat.body.setOffset(0, 0);
      plat.setDepth(10); 
      plat.body.checkCollision.down = false;
      plat.body.checkCollision.left = false;
      plat.body.checkCollision.right = false;
      this.floatingPlatforms.add(plat);
  }

  public spawnBridgeSegment(x: number, y: number) {
      const segment = this.scene.physics.add.sprite(x, y, 'holo_bridge_segment');
      segment.setImmovable(true);
      (segment.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
      segment.setDepth(10);
      segment.body.checkCollision.down = false;
      segment.body.checkCollision.left = false;
      segment.body.checkCollision.right = false;
      segment.setAlpha(0);
      this.scene.tweens.add({ targets: segment, alpha: 1, duration: 300 });
      this.floatingPlatforms.add(segment);
  }

  public spawnSplitLevelSequence() {
      const startX = this.scene.scale.width + 100;
      const midY = this.height - 250;
      this.spawnFloatingPlatform(startX, midY + 100, 1.0);
      this.spawnFloatingPlatform(startX + 250, midY, 1.5);
      this.spawnFloatingPlatform(startX + 550, midY - 80, 2.0);
  }

  public spawnGap(startX: number, gapWidth: number) {
      const groundY = this.height - 128;
      const cliffLeft = this.scene.add.sprite(startX, groundY, 'ground_cliff_left');
      cliffLeft.setOrigin(1, 0);
      cliffLeft.setDepth(1);
      this.cliffSegments.add(cliffLeft);

      const cliffRight = this.scene.add.sprite(startX + gapWidth, groundY, 'ground_cliff_right');
      cliffRight.setOrigin(0, 0);
      cliffRight.setDepth(1);
      this.cliffSegments.add(cliffRight);
  }
  
  public spawnShopGap(startX: number, width: number) {
      // Visuals only for now
  }
  
  public spawnPuzzleGap(x: number, width: number) {
      if (this.body.body) {
          (this.body.body as Phaser.Physics.Arcade.StaticBody).enable = false;
      }
      this.body.setActive(false);
      this.groundTile.setVisible(false);
      
      const leftEnd = x - width/2;
      const rightStart = x + width/2;
      
      const leftCliff = this.scene.add.sprite(leftEnd, this.height - 128, 'ground_cliff_left');
      leftCliff.setOrigin(1, 0);
      leftCliff.setDepth(1);
      this.scene.physics.add.existing(leftCliff, true);
      const lcBody = leftCliff.body as Phaser.Physics.Arcade.StaticBody;
      lcBody.setSize(2000, 128); 
      lcBody.setOffset(-1800, 0); 
      this.cliffSegments.add(leftCliff);
      
      const rightCliff = this.scene.add.sprite(rightStart, this.height - 128, 'ground_cliff_right');
      rightCliff.setOrigin(0, 0);
      rightCliff.setDepth(1);
      this.scene.physics.add.existing(rightCliff, true);
      const rcBody = rightCliff.body as Phaser.Physics.Arcade.StaticBody;
      rcBody.setSize(2000, 128); 
      this.cliffSegments.add(rightCliff);
      
      this.activeSequenceEnd = rightStart + 2000;
  }

  private resetToNormal() {
      this.groundTile.setVisible(true);
      this.cliffSegments.clear(true, true);
      this.ledgeSensorGroup.clear(true, true);
      
      this.body.setActive(true);
      if (this.body.body) {
          (this.body.body as Phaser.Physics.Arcade.StaticBody).enable = true;
      }
  }
}
