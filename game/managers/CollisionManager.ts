
import Phaser from 'phaser';
import { MainScene } from '../scenes/MainScene';
import { Player } from '../objects/Player';
import { Star } from '../objects/Star';
import { Heart } from '../objects/Heart';
import { ShieldItem } from '../objects/ShieldItem';
import { MarketAwning } from '../objects/MarketAwning';
import { MagicCarpet } from '../objects/MagicCarpet';

export class CollisionManager {
  private scene: MainScene;

  constructor(scene: MainScene) {
    this.scene = scene;
  }

  public setupCollisions() {
    const player = this.scene.player;
    const env = this.scene.environmentManager;
    const spawn = this.scene.spawnManager;
    const evt = this.scene.eventManager;

    // Platform Collisions
    this.scene.physics.add.collider(player, env.platform.getCollider());
    this.scene.physics.add.collider(player, env.platform.getFloatingGroup());
    
    if (env.platform.getCliffCollider()) {
        this.scene.physics.add.collider(player, env.platform.getCliffCollider());
    }

    // Interactive Objects (Bounce)
    this.scene.physics.add.collider(player, spawn.marketAwnings, this.handleAwningBounce, undefined, this);

    // Obstacle Collisions (Damage)
    this.scene.physics.add.collider(player, spawn.merchantCarts);
    this.scene.physics.add.collider(player, spawn.rugStacks);
    this.scene.physics.add.overlap(player, spawn.obstacles, this.handleHitObstacle, undefined, this);

    // Fountain Collision (Solid, No Damage)
    if (env.roadside && env.roadside.fountains) {
        this.scene.physics.add.collider(player, env.roadside.fountains);
    }

    // Collectible Overlaps
    this.scene.physics.add.overlap(player, spawn.stars, this.handleCollectStar, undefined, this);
    this.scene.physics.add.overlap(player, spawn.heartsGroup, this.handleCollectHeart, undefined, this);
    this.scene.physics.add.overlap(player, spawn.shieldsGroup, this.handleCollectShield, undefined, this);
    
    // Magic Carpet Pickup (New)
    // We check overlap every frame in update if active, but collision manager is cleaner
    // Since currentCarpet is dynamically created, we can't add it here once. 
    // Instead we check the group if we had one, or handle it manually in update.
    // However, EventManager manages the singleton. Let's add overlap in update loop of main scene or event manager?
    // Actually, checking physics overlap against a single object is cheap.
    // Let's rely on update loop in MainScene calling collision checks or just add it here dynamically?
    // Safer: The CollisionManager is set up once.
    // We'll update the collider in MainScene update if needed, OR just add a "Carpet Group" if we wanted.
    // But since it's a specific unique event item, we can just check it in update() of EventManager or MainScene.
    
    // Hanging Sensor
    this.scene.physics.add.overlap(player, env.platform.getLedgeSensorGroup(), this.handleLedgeGrab, undefined, this);
  }
  
  public checkDynamicOverlaps() {
      // Called from MainScene update
      const player = this.scene.player;
      const carpet = this.scene.eventManager.currentCarpet;
      
      if (carpet && carpet.active && !player.isFlying) {
          this.scene.physics.overlap(player, carpet, () => {
              this.scene.eventManager.triggerCarpetRide();
          });
      }
  }
  
  private handleAwningBounce(playerObj: any, awningObj: any) {
      const player = playerObj as Player;
      const awning = awningObj as MarketAwning;

      // Only bounce if hitting from above
      if (player.body.touching.down && awning.body.touching.up) {
          awning.triggerBounce();
          player.bounce(awning.getBounceForce());
      }
  }
  
  private handleLedgeGrab(playerObj: any, sensorObj: any) {
      const player = playerObj as Player;
      const sensor = sensorObj as Phaser.GameObjects.Rectangle;
      
      if (this.scene.eventManager.eventPhase.startsWith('INTRO')) return;

      if (player.body.velocity.y > 0 && !player.isHanging) {
          const verticalDiff = player.y - sensor.y;
          if (verticalDiff > 20) return; 

          const grabX = sensor.x - 5;
          const grabY = sensor.y - 10; 
          
          this.scene.eventManager.triggerHanging(grabX, grabY);
      }
  }

  private handleCollectStar(player: any, star: any) {
      (star as Star).collect(); 
      this.scene.addScore(10);
      this.scene.showFloatingText((star as Star).x, (star as Star).y, `+١٠`);
  }

  private handleCollectHeart(player: any, heart: any) {
      (heart as Heart).collect();
      if (this.scene.addHeart()) {
          this.scene.showFloatingText(heart.x, heart.y, `قلب +`, '#ff4d4d');
      }
  }

  private handleCollectShield(player: any, shield: any) {
      (shield as ShieldItem).collect();
      this.scene.player.activateShield(10000); 
      this.scene.showFloatingText(shield.x, shield.y, `درع حماية!`, '#00d2ff');
  }

  private handleHitObstacle(player: any, obstacle: any) {
    const p = player as Player;
    const tookDamage = p.takeDamage(() => {});
    if (tookDamage) {
        this.scene.damagePlayer();
        this.scene.cameras.main.shake(200, 0.015);
    }
  }
}
