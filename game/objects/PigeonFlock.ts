
import Phaser from 'phaser';

type Formation = 'RANDOM' | 'LINE' | 'V_SHAPE' | 'SWARM';
type Behavior = 'CRUISE' | 'DIVE' | 'SOAR' | 'OVERTAKE' | 'HOVER';

export class PigeonFlock {
  private scene: Phaser.Scene;
  private birds: Phaser.GameObjects.Group;
  private spawnTimer: number = 0;
  private nextSpawnTime: number = 10000; // Initial spawn delay (10s)

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.birds = scene.add.group({
        runChildUpdate: false
    });
    
    this.generateTexture();
    this.createAnimation();
  }

  public update(dt: number, scrollSpeed: number) {
      this.spawnTimer += dt;
      if (this.spawnTimer > this.nextSpawnTime) {
          this.spawnFlock();
          this.spawnTimer = 0;
          // Make them rare: occur every 25 to 50 seconds
          this.nextSpawnTime = Phaser.Math.Between(25000, 50000); 
      }

      const { width, height } = this.scene.scale;
      const parallaxFactor = 0.5; 

      this.birds.children.each((child: any) => {
          const bird = child as Phaser.GameObjects.Sprite;
          
          const speedX = bird.getData('speedX'); // Positive = Left, Negative = Right
          const speedY = bird.getData('speedY'); // Positive = Up, Negative = Down
          const wobbleFreq = bird.getData('wobbleFreq');
          const wobbleAmp = bird.getData('wobbleAmp');
          const timeOffset = bird.getData('timeOffset');
          const behavior = bird.getData('behavior');
          
          // Movement Calculation
          // Decouple independent flight from parallax.
          // The bird moves by its own speedX regardless of world scroll.
          // World scroll adds extra relative motion.
          
          // Original: (speedX + (scrollSpeed * parallaxFactor)) * dt
          // If scrollSpeed is 0, this is just speedX * dt.
          // BUT, speedX in previous code was "baseSpeedX". 
          // Let's ensure speedX is high enough to be noticeable.
          
          // Logic: 
          // Bird world speed = speedX.
          // Camera scroll effect = scrollSpeed * parallaxFactor.
          // Net screen movement = Bird world speed + Camera Scroll (if bird moving left against scroll)
          // Wait, if bird moves left (positive speedX) and player moves right (scrollSpeed positive),
          // they approach each other. Speed adds up.
          
          const moveX = (speedX + (scrollSpeed * parallaxFactor)) * (dt / 1000);
          
          // Organic wobble on Y axis
          const currentTime = this.scene.time.now;
          const wobble = Math.sin((currentTime + timeOffset) * wobbleFreq) * wobbleAmp * (dt / 1000);
          
          const moveY = (speedY * (dt / 1000)) + wobble;

          bird.x -= moveX;
          bird.y -= moveY;

          // Rotation & Facing Logic
          if (behavior === 'OVERTAKE') {
              bird.setFlipX(true); // Face Right
              bird.setRotation(-0.1); // Slight nose up
          } else if (behavior === 'DIVE') {
              bird.setFlipX(false);
              bird.setRotation(0.4); // Nose down
          } else if (behavior === 'SOAR') {
              bird.setFlipX(false);
              bird.setRotation(-0.4); // Nose up steep
          } else {
              bird.setFlipX(false);
              bird.setRotation(-0.1); // Default slight lift
          }

          // Cleanup if off-screen (with generous margins for swarms)
          if (bird.x < -200 || bird.x > width + 200 || bird.y < -200 || bird.y > height + 200) {
              this.birds.remove(bird, true, true);
          }
          return true;
      });
  }

  private spawnFlock() {
      const { width, height } = this.scene.scale;
      
      // 1. Pick Behavior & Formation
      const behavior = Phaser.Utils.Array.GetRandom([
          'CRUISE', 'CRUISE', 'CRUISE', 
          'DIVE', 'SOAR', 'OVERTAKE', 'HOVER'
      ]) as Behavior;

      const formation = Phaser.Utils.Array.GetRandom([
          'RANDOM', 'V_SHAPE', 'LINE', 'SWARM'
      ]) as Formation;

      // 2. Setup Base Parameters based on Behavior
      let startX = width + 100;
      let startY = Phaser.Math.Between(150, height - 350);
      let baseSpeedX = 250; 
      let baseSpeedY = 20; // Default slight drift up
      
      switch (behavior) {
          case 'DIVE':
              startY = Phaser.Math.Between(50, 200); // High sky
              baseSpeedX = 400; // Fast horizontal
              baseSpeedY = -200; // Negative = Downward movement in our update logic
              break;
          case 'SOAR':
              startY = height - 150; // Low ground
              baseSpeedX = 200;
              baseSpeedY = 150; // Positive = Upward
              break;
          case 'OVERTAKE':
              startX = -150; // Spawn behind player
              baseSpeedX = -700; // Negative = Move Right faster than scroll
              startY = Phaser.Math.Between(100, height - 250);
              break;
          case 'HOVER':
              // Even for hovering, we give them some forward momentum so they don't look frozen if scroll stops
              baseSpeedX = 100; 
              baseSpeedY = 0;
              break;
          case 'CRUISE':
          default:
              baseSpeedX = 250 + Phaser.Math.Between(-50, 50);
              baseSpeedY = 30;
              break;
      }

      const flockSize = Phaser.Math.Between(4, 10);

      // 3. Spawn Individual Birds
      for (let i = 0; i < flockSize; i++) {
          let offX = 0;
          let offY = 0;

          // Formation Logic
          if (formation === 'V_SHAPE') {
              const row = Math.floor((i + 1) / 2);
              const side = i % 2 === 0 ? 1 : -1;
              const direction = behavior === 'OVERTAKE' ? -1 : 1; 
              
              offX = row * 40 * direction; 
              offY = row * 30 * side;
          } else if (formation === 'LINE') {
              const direction = behavior === 'OVERTAKE' ? -1 : 1;
              offX = i * 60 * direction;
              offY = Phaser.Math.Between(-5, 5);
          } else if (formation === 'SWARM') {
              offX = Phaser.Math.Between(0, 120);
              offY = Phaser.Math.Between(-60, 60);
          } else { // RANDOM
              offX = Phaser.Math.Between(0, 200);
              offY = Phaser.Math.Between(-80, 80);
          }

          const bird = this.scene.add.sprite(startX + offX, startY + offY, 'bg_pigeon');
          bird.setDepth(5);
          
          // Visual Variety
          bird.setScale(Phaser.Math.FloatBetween(0.6, 0.9));
          
          const variant = Math.random();
          if (variant > 0.8) bird.setTint(0xffffff); // Pure white
          else if (variant > 0.5) bird.setTint(0xdcdcdc); // Light grey
          else bird.setTint(0xa0a0a0); // Darker grey

          bird.play({
            key: 'pigeon_fly',
            startFrame: Phaser.Math.Between(0, 3)
          }, true);
          
          bird.setData('speedX', baseSpeedX + Phaser.Math.Between(-20, 20));
          bird.setData('speedY', baseSpeedY + Phaser.Math.Between(-15, 15));
          bird.setData('wobbleFreq', Phaser.Math.FloatBetween(0.002, 0.005));
          bird.setData('wobbleAmp', Phaser.Math.Between(15, 40));
          bird.setData('timeOffset', Phaser.Math.Between(0, 1000));
          bird.setData('behavior', behavior);

          this.birds.add(bird);
      }
  }

  private createAnimation() {
      if (this.scene.anims.exists('pigeon_fly')) return;
      
      this.scene.anims.create({
          key: 'pigeon_fly',
          frames: [
              { key: 'bg_pigeon', frame: 'frame_0' },
              { key: 'bg_pigeon', frame: 'frame_1' },
              { key: 'bg_pigeon', frame: 'frame_2' },
              { key: 'bg_pigeon', frame: 'frame_1' } 
          ],
          frameRate: 15,
          repeat: -1
      });
  }

  private generateTexture() {
      if (this.scene.textures.exists('bg_pigeon')) return;

      const frameW = 32;
      const frameH = 32;
      const totalW = frameW * 3;
      
      const canvas = this.scene.textures.createCanvas('bg_pigeon', totalW, frameH);
      if (!canvas) return;
      const ctx = canvas.context;

      ctx.fillStyle = '#cfd8dc'; 

      const drawBird = (offsetX: number, wingState: 'up' | 'flat' | 'down') => {
          ctx.save();
          ctx.translate(offsetX + 16, 16);
          ctx.rotate(-0.1); 

          ctx.beginPath();
          // Body
          if (wingState === 'up') {
              ctx.moveTo(8, 2); ctx.lineTo(2, 2); ctx.lineTo(0, -12); 
              ctx.lineTo(-4, 2); ctx.lineTo(-10, 0); ctx.lineTo(-4, 6); ctx.lineTo(8, 2);
          } else if (wingState === 'flat') {
              ctx.moveTo(8, 2); ctx.lineTo(2, 2); ctx.lineTo(0, 0); 
              ctx.lineTo(-2, -2); ctx.lineTo(-10, 0); ctx.lineTo(-4, 6); ctx.lineTo(8, 2);
              ctx.moveTo(4, 0); ctx.lineTo(-4, -4);
          } else {
              ctx.moveTo(8, 0); ctx.lineTo(2, 0); ctx.lineTo(0, 10); 
              ctx.lineTo(-4, 0); ctx.lineTo(-10, -2); ctx.lineTo(-4, 2); ctx.lineTo(8, 0);
          }
          ctx.fill();
          
          // Neck
          ctx.fillStyle = '#78909c';
          ctx.beginPath(); ctx.arc(-8, 1, 3, 0, Math.PI*2); ctx.fill();

          // Beak
          ctx.fillStyle = '#f1c40f';
          ctx.beginPath(); ctx.moveTo(-10, 1); ctx.lineTo(-13, 2); ctx.lineTo(-10, 3); ctx.fill();

          // Wing Tip
          if (wingState === 'up') {
              ctx.fillStyle = '#ffffff';
              ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(-2, -8); ctx.lineTo(2, -8); ctx.fill();
          }

          ctx.fillStyle = '#cfd8dc'; 
          ctx.restore();
      };

      drawBird(0, 'up');
      drawBird(32, 'flat');
      drawBird(64, 'down');

      canvas.refresh();

      const texture = this.scene.textures.get('bg_pigeon');
      texture.add('frame_0', 0, 0, 0, 32, 32);
      texture.add('frame_1', 0, 32, 0, 32, 32);
      texture.add('frame_2', 0, 64, 0, 32, 32);
  }
}
