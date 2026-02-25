
import Phaser from 'phaser';
import { CityGate } from './CityGate';
import { ForegroundGenerator } from '../generators/ForegroundGenerator';

export class Foreground {
  private scene: Phaser.Scene;
  private width: number;
  private height: number;
  
  private elements: Phaser.GameObjects.Group;
  private nearLayer: Phaser.GameObjects.Group;

  private spawnTimer: number = 0;
  private nextSpawnTime: number = 1000;

  private nearTimer: number = 0;
  private nextNearTime: number = 1500;

  private isSpawningTunnel: boolean = false;
  private tunnelCountRemaining: number = 0;
  private tunnelTimer: number = 0;
  private nextTunnelTime: number = 20000; 

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.width = Math.max(10, Math.ceil(scene.scale.width));
    this.height = Math.max(10, Math.ceil(scene.scale.height));

    ForegroundGenerator.init(scene);
    
    this.elements = scene.add.group({ runChildUpdate: false });
    this.nearLayer = scene.add.group({ runChildUpdate: false });
  }

  public resize(width: number, height: number) {
      this.width = width;
      this.height = height;
  }

  update(delta: number, speed: number) {
    this.spawnTimer += delta;
    this.nearTimer += delta;
    this.tunnelTimer += delta;

    // --- ZONE CHECK ---
    // @ts-ignore - access to manager
    const zone = this.scene.environmentManager ? this.scene.environmentManager.getZone() : 'DESERT';
    const phase = this.scene.eventManager.eventPhase;

    // --- CARPET MODE SPECIAL HANDLING ---
    if (phase === 'CARPET_RIDE') {
        if (this.spawnTimer > this.nextSpawnTime) {
            this.spawnCloudElement();
            this.spawnTimer = 0;
            this.nextSpawnTime = Phaser.Math.Between(1500, 3000);
        }
    } else {
        // --- NORMAL GROUND SPAWNING ---
        
        // --- 1. NEAR LAYER (Parallax pass-by) ---
        if (this.nearTimer > this.nextNearTime) {
            if (zone === 'CITY' || zone === 'TRANSITION') {
                this.spawnCityNearElement();
            } else if (zone === 'LIBRARY') {
                this.spawnLibraryNearElement();
            } else {
                // Sparser near elements in desert
                if (Math.random() > 0.4) this.spawnDesertNearElement(); 
            }
            this.nearTimer = 0;
            this.nextNearTime = Phaser.Math.Between(2000, 4000); 
        }

        // --- 2. STANDARD FOREGROUND ---
        // Tunnel sequence (City Gates) only happens in City/Transition
        if ((zone === 'CITY' || zone === 'TRANSITION') && !this.isSpawningTunnel && this.tunnelTimer > this.nextTunnelTime) {
            this.startTunnelSequence();
        }

        if (this.isSpawningTunnel) {
            if (this.spawnTimer > 1200) { 
                this.spawnCityGate();
                this.spawnTimer = 0;
                this.tunnelCountRemaining--;
                
                if (this.tunnelCountRemaining <= 0) {
                    this.isSpawningTunnel = false;
                    this.nextTunnelTime = Phaser.Math.Between(25000, 40000);
                    this.spawnTimer = -2000; 
                }
            }
        } 
        else {
            if (this.spawnTimer > this.nextSpawnTime) { 
                if (zone === 'DESERT') {
                    this.spawnDesertElement();
                    this.nextSpawnTime = Phaser.Math.Between(3000, 6000); // Sparser
                } else if (zone === 'LIBRARY') {
                    this.spawnLibraryElement();
                    this.nextSpawnTime = Phaser.Math.Between(2500, 5000);
                } else {
                    // City: more visible buildings, platforms, dynamic environment
                    this.spawnCityElement();
                    this.nextSpawnTime = Phaser.Math.Between(1600, 3200);
                }
                this.spawnTimer = 0;
            }
        }
    }

    // --- 3. MOVEMENT ---
    this.elements.children.each((child: any) => {
        const item = child as Phaser.GameObjects.Container;
        let parallax = 1.3;
        if (item.name === 'city_gate') parallax = 1.4; 
        if (item.name === 'fg_cloud') parallax = 1.8; // Clouds move fast
        
        item.x -= speed * parallax;
        const killX = item.name === 'city_gate' ? -1200 : -600;
        if (item.x < killX) item.destroy();
        return true;
    });

    this.nearLayer.children.each((child: any) => {
        const item = child as Phaser.GameObjects.Container;
        item.x -= speed * 1.8; 
        if (item.x < -800) item.destroy();
        return true;
    });
  }

  // --- CLOUD SPAWNER ---
  private spawnCloudElement() {
      // Create a cloud puff in foreground
      const x = this.width + 200;
      const y = Phaser.Math.Between(100, this.height - 100);
      
      const container = this.scene.add.container(x, y);
      container.name = 'fg_cloud';
      
      const cloud = this.scene.add.image(0, 0, 'bg_cloud'); // Reuse background cloud for now
      cloud.setScale(0.8 + Math.random() * 0.5);
      cloud.setAlpha(0.6);
      
      container.add(cloud);
      container.setDepth(100); // Very high, pass in front
      
      this.elements.add(container);
  }

  // --- LIBRARY SPAWNERS ---

  private spawnLibraryElement() {
      const type = Math.random();
      const x = this.width + 100;
      
      if (type < 0.5) {
          // Floating Scroll
          const y = Phaser.Math.Between(this.height - 300, this.height - 150);
          const scroll = this.scene.add.image(0, 0, 'fg_scroll');
          scroll.setOrigin(0.5, 0.5);
          const container = this.scene.add.container(x, y);
          container.add(scroll);
          
          // Float Tween
          this.scene.tweens.add({
              targets: container,
              y: y - 20,
              angle: { from: -5, to: 5 },
              duration: 2000,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut'
          });
          
          container.setDepth(35);
          this.elements.add(container);
      } else {
          // Stack of Books
          const y = this.height + 20; 
          const books = this.scene.add.image(0, 0, 'fg_book_stack');
          books.setOrigin(0.5, 1);
          const container = this.scene.add.container(x, y);
          container.add(books);
          container.setDepth(32);
          this.elements.add(container);
      }
  }

  private spawnLibraryNearElement() {
      const x = this.width + 300;
      // High passing Astrolabe or similar overhead instrument
      const y = -50; 
      
      const astrolabe = this.scene.add.image(0, 0, 'fg_astrolabe');
      astrolabe.setOrigin(0.5, 0); // Hang from top
      
      const container = this.scene.add.container(x, y);
      container.add(astrolabe);
      container.setDepth(100);
      
      // Swing it
      this.scene.tweens.add({
          targets: container,
          rotation: 0.1,
          duration: 3000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
      });

      this.nearLayer.add(container);
  }

  // --- DESERT SPAWNERS ---

  private spawnDesertElement() {
      const type = Math.random();
      const x = this.width + 200;
      const groundY = this.height;

      if (type < 0.3) {
          // Dead Bush
          const bush = this.scene.add.image(0, 0, 'fg_dead_bush');
          bush.setOrigin(0.5, 1);
          bush.setTint(0x000000); 
          bush.setAlpha(0.7);
          const container = this.scene.add.container(x, groundY + 10);
          container.add(bush);
          container.setDepth(35);
          this.elements.add(container);
      } else if (type < 0.55) {
          // Rock Cluster
          const rock = this.scene.add.image(0, 0, 'fg_desert_rocks');
          rock.setOrigin(0.5, 1);
          const container = this.scene.add.container(x, groundY + 20);
          container.add(rock);
          container.setDepth(38);
          this.elements.add(container);
      } else if (type < 0.8) {
          // Bones
          const bones = this.scene.add.image(0, 0, 'fg_bones');
          bones.setOrigin(0.5, 1);
          const container = this.scene.add.container(x, groundY);
          container.add(bones);
          container.setDepth(32);
          this.elements.add(container);
      } else {
          // Desert crate/box
          const crate = this.scene.add.image(0, 0, 'fg_desert_crate');
          crate.setOrigin(0.5, 1);
          const container = this.scene.add.container(x, groundY + 5);
          container.add(crate);
          container.setDepth(34);
          this.elements.add(container);
      }
  }

  private spawnDesertNearElement() {
      // Big foreground silhouette passes
      const x = this.width + 300;
      const y = this.height + 50;
      
      const type = Math.random();
      if (type < 0.5) {
          // Big Rock
          const rock = this.scene.add.image(0, 0, 'fg_desert_rocks');
          rock.setScale(1.5);
          rock.setOrigin(0.5, 1);
          const container = this.scene.add.container(x, y);
          container.add(rock);
          container.setDepth(100);
          this.nearLayer.add(container);
      } else {
          // Ruined Column Silhouette
          const col = this.scene.add.image(0, 0, 'fg_ruined_column');
          col.setScale(1.2);
          col.setOrigin(0.5, 1);
          const container = this.scene.add.container(x, y);
          container.add(col);
          container.setDepth(100);
          this.nearLayer.add(container);
      }
  }

  // --- CITY SPAWNERS ---

  private spawnCityNearElement() {
      const roll = Math.random();
      const x = this.width + 300;

      if (roll < 0.2) {
          const y = this.height + 20; 
          const stall = this.scene.add.image(0, 0, 'fg_near_market');
          stall.setOrigin(0.5, 1);
          stall.setFlipX(Math.random() > 0.5);
          const container = this.scene.add.container(x, y);
          container.add(stall);
          container.setDepth(100);
          this.nearLayer.add(container);
      } else if (roll < 0.4) {
          const y = -20;
          const key = Math.random() > 0.5 ? 'fg_near_laundry' : 'fg_near_lanterns';
          const item = this.scene.add.image(0, 0, key);
          item.setOrigin(0.5, 0);
          const container = this.scene.add.container(x, y);
          container.add(item);
          container.setDepth(101);
          this.nearLayer.add(container);
          this.scene.tweens.add({
              targets: container, angle: { from: -2, to: 2 }, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
          });
      } else if (roll < 0.6) {
          const y = this.height;
          const arch = this.scene.add.image(0, 0, 'fg_near_arch');
          arch.setOrigin(0, 1);
          if (Math.random() > 0.5) arch.setScale(-1, 1);
          const container = this.scene.add.container(x, y);
          container.add(arch);
          container.setDepth(102);
          this.nearLayer.add(container);
      } else if (roll < 0.75) {
          const y = 0;
          const rug = this.scene.add.image(0, 0, 'fg_near_rug');
          rug.setOrigin(0.5, 0);
          if (Math.random() > 0.5) rug.setFlipX(true);
          const container = this.scene.add.container(x, y);
          container.add(rug);
          container.setDepth(101);
          this.nearLayer.add(container);
      } else if (roll < 0.9) {
          const y = this.height + 50;
          const palm = this.scene.add.image(0, 0, 'fg_near_palm');
          palm.setOrigin(0.5, 1);
          if (Math.random() > 0.5) palm.setFlipX(true);
          const container = this.scene.add.container(x, y);
          container.add(palm);
          container.setDepth(102);
          this.nearLayer.add(container);
      } else {
          const y = this.height + 20;
          const crates = this.scene.add.image(0, 0, 'fg_near_crates');
          crates.setOrigin(0.5, 1);
          if (Math.random() > 0.5) crates.setFlipX(true);
          const container = this.scene.add.container(x, y);
          container.add(crates);
          container.setDepth(100);
          this.nearLayer.add(container);
      }
  }

  private startTunnelSequence() {
      this.isSpawningTunnel = true;
      this.tunnelCountRemaining = Phaser.Math.Between(3, 5); 
      this.tunnelTimer = 0;
      this.spawnTimer = 1000; 
  }

  private spawnCityGate() {
      const x = this.width + 550; 
      const y = this.height + 50; 
      const gate = new CityGate(this.scene, x, y);
      gate.name = 'city_gate';
      this.elements.add(gate);
  }

  private spawnCityElement() {
      const type = Math.random();
      if (type < 0.15) this.spawnLanternPost();
      else if (type < 0.25) this.spawnHangingLamp(); 
      else if (type < 0.40) this.spawnAwning(); 
      else if (type < 0.50) this.spawnCarpetRack(); 
      else if (type < 0.60) this.spawnPotteryCluster(); 
      else if (type < 0.70) this.spawnSpiceBaskets(); 
      else if (type < 0.80) this.spawnRooftopVent(); 
      else if (type < 0.90) this.spawnStringLights();
      else { this.spawnArchway(); this.nextSpawnTime += 1500; }
  }

  // --- CITY ELEMENT HELPERS ---
  
  private spawnAwning() {
      const x = this.width + 150;
      const y = -10; 
      const container = this.scene.add.container(x, y);
      const awning = this.scene.add.image(0, 0, 'fg_awning');
      awning.setOrigin(0.5, 0); 
      container.add(awning);
      if (Math.random() > 0.3) {
          const lantern = this.scene.add.image(0, 90, 'fg_hanging_lamp');
          lantern.setScale(0.5); lantern.setOrigin(0.5, 0); container.add(lantern);
          const glow = this.scene.add.image(0, 130, 'fg_lamp_light');
          glow.setScale(0.4).setAlpha(0.4).setBlendMode(Phaser.BlendModes.ADD);
          container.add(glow);
          this.scene.tweens.add({
              targets: [lantern, glow], angle: { from: -5, to: 5 }, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
          });
      }
      this.scene.tweens.add({
          targets: container, rotation: 0.03, duration: 3500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      });
      container.setDepth(38); this.elements.add(container);
  }

  private spawnCarpetRack() {
      const x = this.width + 100; const y = this.height + 40; 
      const container = this.scene.add.container(x, y);
      const rack = this.scene.add.image(0, 0, 'fg_carpet_rack');
      rack.setOrigin(0.5, 1); container.add(rack);
      container.setDepth(37); this.elements.add(container);
  }

  private spawnPotteryCluster() {
      const x = this.width + 100; const y = this.height + 30; 
      const container = this.scene.add.container(x, y);
      const pottery = this.scene.add.image(0, 0, 'fg_pottery');
      pottery.setOrigin(0.5, 1); container.add(pottery);
      container.setDepth(36); this.elements.add(container);
  }

  private spawnSpiceBaskets() {
      const x = this.width + 100; const y = this.height + 25;
      const container = this.scene.add.container(x, y);
      const baskets = this.scene.add.image(0, 0, 'fg_spices');
      baskets.setOrigin(0.5, 1); container.add(baskets);
      container.setDepth(36); this.elements.add(container);
  }

  private spawnHangingLamp() {
      const x = this.width + 100; const y = -20;
      const container = this.scene.add.container(x, y);
      const chainHeight = Phaser.Math.Between(100, 250);
      const chain = this.scene.add.tileSprite(0, chainHeight/2, 4, chainHeight, 'fg_chain');
      container.add(chain);
      const lamp = this.scene.add.image(0, chainHeight, 'fg_hanging_lamp'); container.add(lamp);
      const glow = this.scene.add.image(0, chainHeight + 20, 'fg_lamp_light');
      glow.setScale(0.7).setAlpha(0.5).setBlendMode(Phaser.BlendModes.ADD); container.add(glow);
      this.scene.tweens.add({ targets: container, angle: { from: -3, to: 3 }, duration: Phaser.Math.Between(2500, 4000), yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.scene.tweens.add({ targets: glow, alpha: { from: 0.4, to: 0.6 }, scale: { from: 0.65, to: 0.75 }, duration: 2000, yoyo: true, repeat: -1 });
      container.setDepth(35); this.elements.add(container);
  }

  private spawnRooftopVent() {
      const x = this.width + 100; const y = this.height + 20;
      const container = this.scene.add.container(x, y);
      const vent = this.scene.add.image(0, 0, 'fg_vent');
      vent.setOrigin(0.5, 1); container.add(vent);
      container.setDepth(33); this.elements.add(container);
  }

  private spawnStringLights() {
      const x = this.width + 200; 
      const y = -10; 
      const container = this.scene.add.container(x, y);
      
      const stringLights = this.scene.add.image(0, 0, 'fg_string_lights');
      // Changed origin to TOP-CENTER (0.5, 0) to align with container top
      stringLights.setOrigin(0.5, 0); 
      container.add(stringLights);
      
      const bulbPositions = [
          { x: 0, y: 60 }, 
          { x: -90, y: 55 }, 
          { x: 90, y: 55 }
      ];
      
      bulbPositions.forEach(pos => {
          const glow = this.scene.add.image(pos.x, pos.y, 'fg_lamp_light');
          glow.setScale(0.35).setAlpha(0.4).setBlendMode(Phaser.BlendModes.ADD); 
          container.add(glow);
          this.scene.tweens.add({ targets: glow, alpha: 0.7, scale: 0.45, duration: Phaser.Math.Between(1500, 3000), yoyo: true, repeat: -1 });
      });
      
      container.setDepth(32); 
      this.elements.add(container);
  }

  private spawnLanternPost() {
      const x = this.width + 100; const y = this.height + 40;
      const container = this.scene.add.container(x, y);
      const post = this.scene.add.image(0, 0, 'fg_lantern_post');
      post.setOrigin(0.5, 1); container.add(post);
      const lightY = -340; 
      const glow = this.scene.add.image(15, lightY, 'fg_lamp_light'); 
      glow.setBlendMode(Phaser.BlendModes.ADD); glow.setAlpha(0.4); glow.setScale(0.9); container.add(glow);
      container.setDepth(31); this.elements.add(container);
  }

  private spawnArchway() {
      const x = this.width + 300; const y = this.height + 50; 
      const container = this.scene.add.container(x, y);
      const arch = this.scene.add.image(0, 0, 'fg_arch');
      arch.setOrigin(0.5, 1); arch.setTint(0x8888aa); 
      container.add(arch); container.setDepth(30);
      container.setScale(Phaser.Math.FloatBetween(1.15, 1.25));
      this.elements.add(container);
  }
}
