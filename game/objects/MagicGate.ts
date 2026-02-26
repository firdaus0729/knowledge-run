
import Phaser from 'phaser';

export class MagicGate extends Phaser.GameObjects.Container {
  declare scene: Phaser.Scene;
  declare x: number;
  declare y: number;
  declare add: (child: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]) => this;
  declare setDepth: (value: number) => this;
  declare destroy: (fromScene?: boolean) => void;
  declare active: boolean;

  // Visuals
  private outerArch!: Phaser.GameObjects.Sprite;
  private vortex!: Phaser.GameObjects.Sprite;
  private vortexCore!: Phaser.GameObjects.Sprite;
  private nebula!: Phaser.GameObjects.Sprite;
  private godRays!: Phaser.GameObjects.Image;
  private whiteFlash!: Phaser.GameObjects.Image;
  
  // Debris
  private floatingRocks: Phaser.GameObjects.Image[] = [];

  // Particles
  private suctionEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  private isActivated: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);
    
    this.generateTextures();
    this.createVisuals();
    this.createParticles();
    
    this.setDepth(25); // In front of player
  }

  private createVisuals() {
    // 1. God Rays – golden/mystical glow
    this.godRays = this.scene.add.image(0, -250, 'gate_rays');
    this.godRays.setBlendMode(Phaser.BlendModes.ADD);
    this.godRays.setAlpha(0.45);
    this.godRays.setScale(3.0);
    this.godRays.setTint(0xffd700);
    this.add(this.godRays);

    this.scene.tweens.add({
        targets: this.godRays,
        angle: 360,
        duration: 35000,
        repeat: -1,
        ease: 'Linear'
    });

    // 2. Cosmic Background (Nebula) – golden mystical energy
    this.nebula = this.scene.add.sprite(0, -250, 'gate_nebula');
    this.nebula.setAlpha(0.8);
    this.nebula.setScale(0.8);
    this.nebula.setBlendMode(Phaser.BlendModes.ADD);
    this.nebula.setTint(0xffcc44);
    this.add(this.nebula);
    
    this.scene.tweens.add({
        targets: this.nebula,
        angle: -360,
        duration: 20000,
        repeat: -1,
        ease: 'Linear'
    });

    // 3. The Vortex (Swirling star field)
    this.vortex = this.scene.add.sprite(0, -250, 'gate_portal_swirl');
    this.vortex.setAlpha(0.9);
    this.vortex.setScale(0.2);
    this.vortex.setBlendMode(Phaser.BlendModes.ADD);
    this.add(this.vortex);

    this.scene.tweens.add({
        targets: this.vortex,
        angle: 360,
        duration: 8000,
        repeat: -1,
        ease: 'Linear'
    });

    // 4. Vortex Core (Bright golden center – “entering the light”)
    this.vortexCore = this.scene.add.sprite(0, -250, 'gate_core');
    this.vortexCore.setScale(0.5);
    this.vortexCore.setAlpha(1);
    this.vortexCore.setBlendMode(Phaser.BlendModes.ADD);
    this.vortexCore.setTint(0xffdd77);
    this.add(this.vortexCore);

    // 5. Ancient Floating Arch
    this.outerArch = this.scene.add.sprite(0, 0, 'gate_ancient_arch');
    this.outerArch.setOrigin(0.5, 1);
    this.add(this.outerArch);

    this.scene.tweens.add({
        targets: this.outerArch,
        y: '-=15',
        duration: 2500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });

    // 6. Floating Debris (Rocks)
    const debrisPos = [
        { x: -220, y: -450, s: 0.6 },
        { x: 220, y: -400, s: 0.8 },
        { x: -260, y: -150, s: 0.5 },
        { x: 260, y: -100, s: 0.7 }
    ];
    debrisPos.forEach((pos, i) => {
        const rock = this.scene.add.image(pos.x, pos.y, 'gate_debris');
        rock.setScale(pos.s);
        this.add(rock);
        this.floatingRocks.push(rock);
        this.scene.tweens.add({
            targets: rock,
            y: pos.y + (Math.random() * 20 - 10),
            angle: Math.random() * 10 - 5,
            duration: 2000 + Math.random() * 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    });

    // 7. White Flash (Transition)
    this.whiteFlash = this.scene.add.image(0, -250, 'gate_flash_burst');
    this.whiteFlash.setScale(0);
    this.whiteFlash.setAlpha(0);
    this.whiteFlash.setBlendMode(Phaser.BlendModes.ADD);
    this.add(this.whiteFlash);
  }

  private createParticles() {
      if (!this.scene.textures.exists('star_collectible')) return;
      this.suctionEmitter = this.scene.add.particles(0, -250, 'star_collectible', {
          scale: { start: 0.4, end: 0 },
          alpha: { start: 0, end: 1, ease: 'Sine.easeIn' },
          lifespan: 1000,
          speed: 0,
          quantity: 3,
          frequency: 40,
          blendMode: 'ADD',
          tint: [0xffd700, 0xffa500, 0xff8c00],
          emitZone: { type: 'edge', source: new Phaser.Geom.Circle(0, 0, 400), quantity: 24 },
          moveToX: 0,
          moveToY: -250,
          emitting: true
      });
      this.add(this.suctionEmitter);
  }

  public open() {
      if (this.isActivated) return;
      this.isActivated = true;

      // Magical portal sound (plays if loaded in MainScene preload)
      try {
          this.scene.sound.add('portal_open').play({ volume: 0.6 });
      } catch (_) {}

      // A. RAMP UP EFFECTS - MASSIVE SIZE INCREASE
      
      // 1. Nebula Expands to fill background
      this.scene.tweens.add({
          targets: this.nebula,
          scale: 6.0, 
          alpha: 0.9,
          duration: 3000,
          ease: 'Cubic.out'
      });

      // 2. Vortex Swirl Expands hugely
      this.scene.tweens.add({
          targets: this.vortex,
          scale: 4.5, 
          alpha: 1,
          duration: 2500,
          ease: 'Power2.inOut'
      });
      
      // 3. Core Ignites
      this.scene.tweens.add({
          targets: this.vortexCore,
          scale: 6.0,
          alpha: 1,
          duration: 2000,
          ease: 'Expo.in'
      });

      // 4. Spin Faster
      this.scene.tweens.add({
          targets: [this.vortex, this.nebula],
          timeScale: 10, 
          duration: 2000,
          ease: 'Cubic.in'
      });

      // 5. Rays Brighten and Expand
      this.scene.tweens.add({
          targets: this.godRays,
          scale: 5.0,
          alpha: 0.9,
          duration: 2000,
          ease: 'Sine.out'
      });

      this.suctionEmitter.setConfig({
          frequency: 5,
          quantity: 10,
          timeScale: 3.0
      });

      this.floatingRocks.forEach(rock => {
          this.scene.tweens.add({
              targets: rock,
              x: 0,
              y: -250,
              scale: 0,
              angle: 360,
              duration: 800,
              ease: 'Back.in'
          });
      });

      // B. EXPLOSION SEQUENCE (Transition)
      this.scene.time.delayedCall(1500, () => {
          this.scene.cameras.main.shake(1500, 0.025);
          
          // Flash expands to cover screen
          this.scene.tweens.add({
              targets: this.whiteFlash,
              scale: 40, 
              alpha: 1,
              duration: 1200,
              ease: 'Expo.in'
          });
      });
  }

  update(speed: number) {
      this.x -= speed;
      if (this.x < -1000) {
          this.destroy();
      }
  }

  private generateTextures() {
      // FIX: Ensure we call refresh() on the Texture instance, NOT the context.
      const getTexture = (name: string, w: number, h: number) => {
          if (this.scene.textures.exists(name)) {
              this.scene.textures.remove(name);
          }
          return this.scene.textures.createCanvas(name, w, h);
      };

      // 1. GOLDEN RING FRAME (circular portal frame – like reference image)
      const archTex = getTexture('gate_ancient_arch', 600, 800);
      if (archTex) {
          const ctx = archTex.context;
          const cx = 300;
          const cy = 250;
          const outerR = 260;
          const innerR = 200;
          ctx.beginPath();
          ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
          ctx.arc(cx, cy, innerR, 0, Math.PI * 2, true);
          const ringGrd = ctx.createRadialGradient(cx, cy, innerR, cx, cy, outerR);
          ringGrd.addColorStop(0, 'rgba(255, 200, 0, 0)');
          ringGrd.addColorStop(0.3, 'rgba(255, 180, 0, 0.4)');
          ringGrd.addColorStop(0.7, 'rgba(218, 165, 32, 0.9)');
          ringGrd.addColorStop(1, 'rgba(184, 134, 11, 0.95)');
          ctx.fillStyle = ringGrd;
          ctx.fill();
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 8;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 215, 0, 0.9)';
          ctx.lineWidth = 4;
          ctx.stroke();
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#ff8c00';
          ctx.beginPath();
          ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
          ctx.strokeStyle = '#ffa500';
          ctx.lineWidth = 6;
          ctx.stroke();
          ctx.shadowBlur = 0;
          archTex.refresh();
      }

      // 2. PORTAL SWIRL (golden vortex – spiral like reference, all gold)
      const swirlTex = getTexture('gate_portal_swirl', 512, 512);
      if (swirlTex) {
          const ctx = swirlTex.context;
          const cx = 256;
          for (let arm = 0; arm < 4; arm++) {
              ctx.beginPath();
              const offset = (Math.PI * 2 / 4) * arm;
              for (let i = 0; i < 110; i++) {
                  const angle = 0.09 * i + offset;
                  const radius = i * 2.6;
                  const x = cx + Math.cos(angle) * radius;
                  const y = cx + Math.sin(angle) * radius;
                  if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
              }
              const grd = ctx.createRadialGradient(cx, cx, 0, cx, cx, 256);
              grd.addColorStop(0, 'rgba(255, 255, 220, 0)');
              grd.addColorStop(0.25, 'rgba(255, 220, 100, 0.95)');
              grd.addColorStop(0.5, 'rgba(255, 180, 50, 0.85)');
              grd.addColorStop(0.75, 'rgba(218, 165, 32, 0.4)');
              grd.addColorStop(1, 'rgba(184, 134, 11, 0)');
              ctx.lineWidth = 26 - (arm * 3);
              ctx.lineCap = 'round';
              ctx.strokeStyle = grd;
              ctx.stroke();
          }
          swirlTex.refresh();
      }

      // 3. NEBULA (rich gold halo – as gold as possible)
      const nebTex = getTexture('gate_nebula', 512, 512);
      if (nebTex) {
          const ctx = nebTex.context;
          const cx = 256;
          const grd = ctx.createRadialGradient(cx, cx, 10, cx, cx, 255);
          grd.addColorStop(0, 'rgba(255, 235, 150, 0.95)');
          grd.addColorStop(0.3, 'rgba(255, 200, 80, 0.8)');
          grd.addColorStop(0.6, 'rgba(218, 165, 32, 0.4)');
          grd.addColorStop(1, 'rgba(184, 134, 11, 0)');
          ctx.fillStyle = grd;
          ctx.fillRect(0, 0, 512, 512);
          nebTex.refresh();
      }

      // 4. CORE (Intense white/pink center – “entering the light”)
      const coreTex = getTexture('gate_core', 128, 128);
      if (coreTex) {
          const ctx = coreTex.context;
          const cx = 64;
          const grd = ctx.createRadialGradient(cx, cx, 0, cx, cx, 64);
          grd.addColorStop(0, '#ffffff');
          grd.addColorStop(0.15, 'rgba(255, 250, 200, 0.98)');
          grd.addColorStop(0.35, 'rgba(255, 220, 100, 0.9)');
          grd.addColorStop(0.6, 'rgba(255, 180, 50, 0.5)');
          grd.addColorStop(1, 'rgba(218, 165, 32, 0)');
          ctx.fillStyle = grd;
          ctx.fillRect(0, 0, 128, 128);
          coreTex.refresh();
      }

      // 5. DEBRIS ROCK
      const debrisTex = getTexture('gate_debris', 64, 64);
      if (debrisTex) {
          const ctx = debrisTex.context;
          ctx.fillStyle = '#212121';
          ctx.beginPath();
          ctx.moveTo(32, 0); ctx.lineTo(64, 20); ctx.lineTo(50, 64); ctx.lineTo(10, 50); ctx.lineTo(0, 20);
          ctx.fill();
          // Highlight
          ctx.strokeStyle = '#424242';
          ctx.lineWidth = 2;
          ctx.stroke();
          debrisTex.refresh(); // CORRECT
      }

      // 6. RAYS
      const rayTex = getTexture('gate_rays', 512, 512);
      if(rayTex) {
          const ctx = rayTex.context;
          const cx = 256;
          ctx.fillStyle = '#ffffff';
          for(let i=0; i<16; i++) {
              ctx.beginPath();
              ctx.moveTo(cx, cx);
              const a = (Math.PI * 2 * i) / 16;
              ctx.arc(cx, cx, 250, a - 0.02, a + 0.02);
              ctx.fill();
          }
          // Soften
          const mask = ctx.createRadialGradient(cx, cx, 20, cx, cx, 250);
          mask.addColorStop(0, 'rgba(255,255,255,1)');
          mask.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.globalCompositeOperation = 'destination-in';
          ctx.fillStyle = mask;
          ctx.fillRect(0,0,512,512);
          rayTex.refresh(); // CORRECT
      }
      
      // 7. FLASH BURST
      const flashTex = getTexture('gate_flash_burst', 512, 512);
      if (flashTex) {
          const ctx = flashTex.context;
          const cx = 256;
          const grd = ctx.createRadialGradient(cx, cx, 0, cx, cx, 256);
          grd.addColorStop(0, '#ffffff'); 
          grd.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = grd;
          ctx.fillRect(0,0,512,512);
          flashTex.refresh(); // CORRECT
      }
  }
}
