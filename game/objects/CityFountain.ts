
import Phaser from 'phaser';

export class CityFountain extends Phaser.GameObjects.Container {
  declare name: string;
  declare add: (child: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]) => this;
  declare setDepth: (value: number) => this;
  declare setScale: (x: number, y?: number) => this;
  declare body: Phaser.Physics.Arcade.Body; // Declare physics body

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);
    scene.physics.add.existing(this); // Enable physics on the Container

    // Setup Physics Body
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setImmovable(true);
    body.setAllowGravity(false);
    
    // Improved Hitbox:
    // Visual Width is ~200px (Texture) * 1.2 (Scale) = 240px wide at widest point.
    // The base is solid, but we want the player to only hit the core stone part, not the water spray or edges.
    // Setting width to 100px ensures you only collide if you really hit the center.
    // Height 40px ensures you only collide if you are running on the ground, not jumping over it.
    body.setSize(100, 40); 
    
    // Offset:
    // Origin is (0.5, 1) -> Bottom Center.
    // Physics Body Origin is Top-Left of the defined box relative to Container Center.
    // X: -50 to center a 100px box.
    // Y: -40 to place the box at the bottom 40px of the sprite height.
    body.setOffset(-50, -40);

    // Sprite is anchored bottom-center
    const fountain = scene.add.sprite(0, 0, 'city_fountain');
    fountain.setOrigin(0.5, 1);
    this.add(fountain);
    
    // Scale up for grandeur
    this.setScale(1.2);

    // Enhanced Water Particles
    if (scene.textures.exists('sparkle')) {
      // 1. Top Spout spray
      const spoutEmitter = scene.add.particles(0, -135, 'sparkle', {
          speedY: { min: -80, max: -120 },
          speedX: { min: -30, max: 30 },
          gravityY: 400,
          scale: { start: 0.3, end: 0 },
          lifespan: 700,
          quantity: 2,
          frequency: 50,
          tint: 0xb3e5fc, // Light blue
          blendMode: 'ADD'
      });

      // 2. Lower Basin Splash (Wide)
      const splashEmitter = scene.add.particles(0, -50, 'sparkle', {
        speedY: { min: -20, max: -50 },
        speedX: { min: -10, max: 10 },
        gravityY: 100,
        scale: { start: 0.2, end: 0 },
        lifespan: 400,
        quantity: 1,
        frequency: 80,
        tint: 0x4fc3f7,
        blendMode: 'ADD',
        emitZone: { type: 'random', source: new Phaser.Geom.Rectangle(-40, 0, 80, 5) }
      });

      this.add(spoutEmitter);
      this.add(splashEmitter);
    }

    this.setDepth(9.6);
  }

  static generateTexture(scene: Phaser.Scene) {
      if (scene.textures.exists('city_fountain')) return;
      
      // Increased Canvas Size for a Grand Fountain
      const W = 200, H = 160;
      const canvas = scene.textures.createCanvas('city_fountain', W, H);
      if (!canvas) return;
      const ctx = canvas.context;
      const cx = W / 2;
      const bottomY = H;

      // --- 1. MAIN BASIN (Octagonal/Geometric Shape) ---
      const basinW = 160;
      const basinH = 50;
      const basinY = bottomY - basinH;

      // Outer rim structure
      const grd = ctx.createLinearGradient(0, basinY, 0, bottomY);
      grd.addColorStop(0, '#90a4ae'); // Light Stone
      grd.addColorStop(1, '#546e7a'); // Shadow Stone
      ctx.fillStyle = grd;
      
      ctx.beginPath();
      ctx.moveTo(cx - basinW/2 + 20, bottomY); // Bottom Left
      ctx.lineTo(cx + basinW/2 - 20, bottomY); // Bottom Right
      ctx.lineTo(cx + basinW/2, basinY); // Top Right Rim
      ctx.lineTo(cx - basinW/2, basinY); // Top Left Rim
      ctx.closePath();
      ctx.fill();

      // Rim Highlight
      ctx.fillStyle = '#cfd8dc';
      ctx.fillRect(cx - basinW/2 - 5, basinY, basinW + 10, 8);

      // Geometric Pattern on Basin
      ctx.fillStyle = '#455a64';
      ctx.beginPath();
      ctx.arc(cx, bottomY - 25, 12, 0, Math.PI*2); // Center circle
      ctx.fill();
      ctx.strokeStyle = '#37474f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 30, basinY + 10); ctx.lineTo(cx - 30, bottomY - 10); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 30, basinY + 10); ctx.lineTo(cx + 30, bottomY - 10); ctx.stroke();

      // Water in Basin
      ctx.fillStyle = '#0277bd';
      ctx.fillRect(cx - basinW/2 + 5, basinY + 5, basinW - 10, 5);


      // --- 2. CENTRAL PILLAR ---
      const pillarW = 40;
      const pillarH = 60;
      const pillarY = basinY - pillarH;
      
      ctx.fillStyle = '#78909c';
      ctx.fillRect(cx - pillarW/2, pillarY, pillarW, pillarH + 10);
      
      // Pillar Detail
      ctx.fillStyle = '#546e7a';
      ctx.fillRect(cx - 10, pillarY + 10, 20, 40); // Inner inset


      // --- 3. UPPER BOWL ---
      const bowlW = 80;
      const bowlY = pillarY;
      
      ctx.fillStyle = '#90a4ae';
      ctx.beginPath();
      ctx.moveTo(cx - 10, bowlY + 20); // Stem connection
      ctx.lineTo(cx + 10, bowlY + 20);
      ctx.lineTo(cx + bowlW/2, bowlY); // Rim
      ctx.lineTo(cx - bowlW/2, bowlY);
      ctx.fill();
      
      // Bowl Rim
      ctx.fillStyle = '#cfd8dc';
      ctx.fillRect(cx - bowlW/2 - 2, bowlY - 5, bowlW + 4, 5);


      // --- 4. TOP SPIRE ---
      ctx.fillStyle = '#546e7a';
      ctx.fillRect(cx - 5, bowlY - 25, 10, 25);
      // Gold Finial
      ctx.fillStyle = '#ffd700';
      ctx.beginPath(); ctx.arc(cx, bowlY - 25, 6, 0, Math.PI*2); ctx.fill();


      // --- 5. WATER EFFECTS (Static Sheets) ---
      // Water falling from top bowl
      ctx.fillStyle = 'rgba(79, 195, 247, 0.5)';
      
      // Left Sheet
      ctx.beginPath();
      ctx.moveTo(cx - 35, bowlY);
      ctx.quadraticCurveTo(cx - 45, bowlY + 20, cx - 40, basinY + 5);
      ctx.lineTo(cx - 20, basinY + 5);
      ctx.quadraticCurveTo(cx - 25, bowlY + 20, cx - 15, bowlY);
      ctx.fill();

      // Right Sheet
      ctx.beginPath();
      ctx.moveTo(cx + 35, bowlY);
      ctx.quadraticCurveTo(cx + 45, bowlY + 20, cx + 40, basinY + 5);
      ctx.lineTo(cx + 20, basinY + 5);
      ctx.quadraticCurveTo(cx + 25, bowlY + 20, cx + 15, bowlY);
      ctx.fill();

      canvas.refresh();
  }
}
