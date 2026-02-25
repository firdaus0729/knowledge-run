
import Phaser from 'phaser';

export type ObstacleType = 'spikes' | 'rock' | 'pillar' | 'orb' | 'snake' | 'wall' | 'falcon' | 'cactus' | 'archway' | 'scorpion' | 'viper' | 'arfaj' | 'book_pile';

export class Obstacle extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  declare scene: Phaser.Scene;
  declare x: number;
  declare y: number;
  declare active: boolean;
  declare setOrigin: (x?: number, y?: number) => this;
  declare setDepth: (value: number) => this;
  declare destroy: (fromScene?: boolean) => void;

  private obstacleType: ObstacleType;
  private moveSpeedModifier: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, type: ObstacleType) {
    super(scene, x, y, `obs_${type}`);
    this.obstacleType = type;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // CRITICAL: Obstacles must be above background (Negative) and Ground (0)
    this.setDepth(5); 

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);

    this.setupTypeSpecifics();
  }

  private setupTypeSpecifics() {
    const body = this.body as Phaser.Physics.Arcade.Body;

    switch (this.obstacleType) {
      case 'spikes':
        this.setOrigin(0.5, 1);
        body.setSize(48, 24);
        body.setOffset(8, 40);
        break;

      case 'rock':
        this.setOrigin(0.5, 1);
        body.setSize(40, 40);
        body.setOffset(12, 24);
        break;

      case 'pillar':
        this.setOrigin(0.5, 1);
        body.setSize(30, 80);
        body.setOffset(17, 16);
        break;

      case 'orb':
        this.setOrigin(0.5, 0.5);
        body.setCircle(18, 15, 15);
        this.addFloatAnimation();
        this.addGlowAnimation();
        break;

      case 'snake':
        this.setOrigin(0.5, 1);
        body.setSize(30, 70); 
        body.setOffset(17, 26);
        this.scene.tweens.add({
            targets: this,
            angle: { from: -5, to: 5 },
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        break;

      case 'wall':
        this.setOrigin(0.5, 1);
        body.setSize(32, 60);
        body.setOffset(16, 4);
        break;

      case 'falcon':
        this.setOrigin(0.5, 0.5);
        body.setSize(60, 30);
        body.setOffset(18, 30);
        this.addFloatAnimation(15, 600); 
        this.moveSpeedModifier = 120; 
        break;

      case 'cactus':
        this.setOrigin(0.5, 1);
        body.setSize(25, 55);
        body.setOffset(19, 9);
        break;

      case 'archway':
        this.setOrigin(0.5, 1);
        body.setSize(40, 85);
        body.setOffset(44, 43); 
        break;

      case 'scorpion':
        this.setOrigin(0.5, 1);
        body.setSize(48, 30); 
        body.setOffset(8, 34);
        this.scene.tweens.add({
            targets: this,
            scaleY: { from: 1, to: 1.05 },
            angle: { from: -2, to: 2 },
            duration: 200, 
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        break;

      case 'viper':
        this.setOrigin(0.5, 1);
        body.setSize(35, 25);
        body.setOffset(14, 39);
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.05,
            scaleY: 0.95,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        break;

      case 'arfaj':
        this.setOrigin(0.5, 1);
        body.setSize(50, 35);
        body.setOffset(7, 29);
        break;
        
      case 'book_pile':
        this.setOrigin(0.5, 1);
        body.setSize(50, 45); // Roughly the pile size
        body.setOffset(15, 35);
        break;
    }
  }

  private addFloatAnimation(distance: number = 20, duration: number = 1500) {
    this.scene.tweens.add({
      targets: this,
      y: this.y - distance,
      duration: duration,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private addGlowAnimation() {
    this.scene.tweens.add({
        targets: this,
        alpha: 0.8,
        scale: 0.9,
        duration: 800,
        yoyo: true,
        repeat: -1
    });
  }

  update(speed: number) {
    this.x -= (speed + (this.moveSpeedModifier * (speed/350)));
    
    if (this.x < -100) {
      this.destroy();
    }
  }

  static generateTextures(scene: Phaser.Scene) {
    this.generateSpikes(scene);
    this.generateRock(scene);
    this.generatePillar(scene);
    this.generateOrb(scene);
    this.generateSnake(scene); 
    this.generateWall(scene);
    this.generateFalcon(scene); 
    this.generateCactus(scene);
    this.generateArchway(scene);
    this.generateScorpion(scene);
    this.generateViper(scene);
    this.generateArfaj(scene);
    this.generateBookPile(scene);
  }

  private static generateSpikes(scene: Phaser.Scene) {
    if (scene.textures.exists('obs_spikes')) return;
    const canvas = scene.textures.createCanvas('obs_spikes', 64, 64);
    if (!canvas) return;
    const ctx = canvas.context;
    ctx.fillStyle = '#2d3436'; 
    const drawSpike = (ox: number) => {
        const grd = ctx.createLinearGradient(ox, 64, ox, 20);
        grd.addColorStop(0, '#636e72');
        grd.addColorStop(0.6, '#b2bec3'); 
        grd.addColorStop(1, '#ff7675'); 
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.moveTo(ox - 10, 64); ctx.lineTo(ox, 24); ctx.lineTo(ox + 10, 64); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ox - 10, 64); ctx.lineTo(ox, 24); ctx.stroke();
    };
    drawSpike(16); drawSpike(32); drawSpike(48);
    canvas.refresh();
  }

  private static generateRock(scene: Phaser.Scene) {
    if (scene.textures.exists('obs_rock')) return;
    const canvas = scene.textures.createCanvas('obs_rock', 64, 64);
    if (!canvas) return;
    const ctx = canvas.context;
    ctx.fillStyle = '#5d4037'; 
    ctx.beginPath(); ctx.moveTo(10, 64); ctx.lineTo(15, 30); ctx.lineTo(35, 20); ctx.lineTo(55, 35); ctx.lineTo(50, 64); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#8d6e63'; ctx.beginPath(); ctx.moveTo(15, 30); ctx.lineTo(35, 20); ctx.lineTo(40, 45); ctx.lineTo(20, 50); ctx.fill();
    ctx.fillStyle = '#a1887f'; ctx.beginPath(); ctx.moveTo(35, 20); ctx.lineTo(55, 35); ctx.lineTo(40, 45); ctx.fill();
    ctx.strokeStyle = '#3e2723'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(25, 40); ctx.lineTo(30, 45); ctx.lineTo(28, 55); ctx.stroke();
    canvas.refresh();
  }

  private static generatePillar(scene: Phaser.Scene) {
    if (scene.textures.exists('obs_pillar')) return;
    const W = 64, H = 96;
    const canvas = scene.textures.createCanvas('obs_pillar', W, H);
    if (!canvas) return;
    const ctx = canvas.context;
    const grd = ctx.createLinearGradient(0, 0, W, 0);
    grd.addColorStop(0, '#546e7a'); grd.addColorStop(0.5, '#78909c'); grd.addColorStop(1, '#455a64');
    ctx.fillStyle = grd; ctx.fillRect(16, 0, 32, H);
    ctx.fillStyle = '#37474f'; ctx.fillRect(14, 0, 36, 12); ctx.fillRect(12, H-12, 40, 12);
    ctx.fillStyle = '#cfd8dc'; ctx.beginPath(); ctx.moveTo(32, 25); ctx.lineTo(40, 40); ctx.lineTo(32, 55); ctx.lineTo(24, 40); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(20, 15, 2, H-30); ctx.fillRect(42, 15, 2, H-30);
    canvas.refresh();
  }

  private static generateOrb(scene: Phaser.Scene) {
    if (scene.textures.exists('obs_orb')) return;
    const S = 48;
    const canvas = scene.textures.createCanvas('obs_orb', S, S);
    if (!canvas) return;
    const ctx = canvas.context;
    const cx = S/2, cy = S/2;
    const aura = ctx.createRadialGradient(cx, cy, 10, cx, cy, 22);
    aura.addColorStop(0, 'rgba(142, 68, 173, 1)'); aura.addColorStop(1, 'rgba(142, 68, 173, 0)');
    ctx.fillStyle = aura; ctx.fillRect(0,0,S,S);
    const core = ctx.createRadialGradient(cx-4, cy-4, 2, cx, cy, 12);
    core.addColorStop(0, '#ffffff'); core.addColorStop(0.3, '#9b59b6'); core.addColorStop(1, '#2c3e50');
    ctx.fillStyle = core; ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#e056fd'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, 14, 0, 1.5); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 14, 2.5, 4); ctx.stroke();
    canvas.refresh();
  }

  private static generateSnake(scene: Phaser.Scene) {
      if (scene.textures.exists('obs_snake')) return;
      const W = 64, H = 96; 
      const canvas = scene.textures.createCanvas('obs_snake', W, H);
      if (!canvas) return;
      const ctx = canvas.context;
      const cx = W / 2;
      const bottomY = H;
      const cBody = '#2e7d32'; const cBelly = '#f1c40f'; const cDark = '#1b5e20';
      ctx.fillStyle = cBody; ctx.beginPath(); ctx.ellipse(cx, bottomY - 10, 20, 10, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = cDark; ctx.beginPath(); ctx.ellipse(cx, bottomY - 14, 16, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = cBody; ctx.beginPath(); ctx.moveTo(cx - 10, bottomY - 10);
      ctx.bezierCurveTo(cx - 20, bottomY - 30, cx + 15, bottomY - 40, cx + 5, bottomY - 60);
      ctx.lineTo(cx - 5, bottomY - 60); ctx.bezierCurveTo(cx + 5, bottomY - 40, cx - 10, bottomY - 30, cx + 6, bottomY - 10); ctx.fill();
      ctx.fillStyle = cBody; ctx.beginPath(); ctx.ellipse(cx, bottomY - 65, 18, 12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = cBelly; ctx.beginPath(); ctx.ellipse(cx, bottomY - 65, 10, 10, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = cDark; ctx.beginPath(); ctx.arc(cx, bottomY - 72, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffeb3b'; ctx.beginPath(); ctx.arc(cx - 4, bottomY - 74, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 4, bottomY - 74, 2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#000'; ctx.fillRect(cx - 4.5, bottomY - 75, 1, 2); ctx.fillRect(cx + 3.5, bottomY - 75, 1, 2);
      ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 1; for(let i=0; i<5; i++) { ctx.beginPath(); ctx.moveTo(cx - 6, bottomY - 60 - i*3); ctx.lineTo(cx + 6, bottomY - 60 - i*3); ctx.stroke(); }
      ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx, bottomY - 70); ctx.quadraticCurveTo(cx, bottomY - 65, cx - 3, bottomY - 62); ctx.moveTo(cx, bottomY - 65); ctx.lineTo(cx + 3, bottomY - 62); ctx.stroke();
      canvas.refresh();
  }

  private static generateWall(scene: Phaser.Scene) {
      if (scene.textures.exists('obs_wall')) return;
      const canvas = scene.textures.createCanvas('obs_wall', 64, 64);
      if (!canvas) return;
      const ctx = canvas.context;
      ctx.fillStyle = '#e67e22'; ctx.fillRect(16, 0, 32, 64);
      ctx.fillStyle = '#d35400';
      for(let y=0; y<64; y+=16) { ctx.fillRect(16, y, 32, 2); if ((y/16) % 2 === 0) ctx.fillRect(32, y, 2, 16); }
      ctx.fillStyle = '#f1c40f'; ctx.fillRect(14, 0, 36, 6);
      canvas.refresh();
  }

  private static generateFalcon(scene: Phaser.Scene) {
      if (scene.textures.exists('obs_falcon')) return;
      const W = 96, H = 64; 
      const canvas = scene.textures.createCanvas('obs_falcon', W, H);
      if (!canvas) return;
      const ctx = canvas.context;
      const cx = W / 2, cy = H / 2;
      ctx.fillStyle = '#5d4037'; ctx.beginPath(); ctx.moveTo(cx, cy + 5); ctx.lineTo(cx - 45, cy - 15); 
      ctx.quadraticCurveTo(cx - 20, cy + 10, cx, cy + 15); ctx.lineTo(cx + 45, cy - 15); 
      ctx.quadraticCurveTo(cx + 20, cy + 10, cx, cy + 5); ctx.fill();
      ctx.fillStyle = '#8d6e63'; ctx.beginPath(); ctx.moveTo(cx, cy + 5); ctx.lineTo(cx - 40, cy - 10);
      ctx.quadraticCurveTo(cx - 25, cy + 5, cx, cy + 10); ctx.lineTo(cx + 40, cy - 10);
      ctx.quadraticCurveTo(cx + 25, cy + 5, cx, cy + 5); ctx.fill();
      ctx.fillStyle = '#fdfbf7'; ctx.beginPath(); ctx.ellipse(cx, cy + 8, 10, 16, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#5d4037'; ctx.beginPath(); ctx.arc(cx - 5, cy - 2, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3e2723'; ctx.beginPath(); ctx.arc(cx - 5, cy - 2, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx - 6, cy - 3, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.moveTo(cx - 12, cy - 4); ctx.lineTo(cx - 18, cy + 2); ctx.lineTo(cx - 8, cy + 4); ctx.fill();
      ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.moveTo(cx - 4, cy + 20); ctx.lineTo(cx - 6, cy + 26); ctx.lineTo(cx - 2, cy + 24); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx + 4, cy + 20); ctx.lineTo(cx + 2, cy + 26); ctx.lineTo(cx + 6, cy + 24); ctx.fill();
      canvas.refresh();
  }

  private static generateCactus(scene: Phaser.Scene) {
      if (scene.textures.exists('obs_cactus')) return;
      const canvas = scene.textures.createCanvas('obs_cactus', 64, 64);
      if (!canvas) return;
      const ctx = canvas.context;
      ctx.fillStyle = '#16a085'; ctx.beginPath(); ctx.moveTo(25, 64); ctx.lineTo(25, 20); ctx.quadraticCurveTo(32, 10, 39, 20); ctx.lineTo(39, 64); ctx.fill();
      ctx.beginPath(); ctx.moveTo(25, 40); ctx.quadraticCurveTo(15, 40, 15, 30); ctx.lineTo(15, 25); ctx.quadraticCurveTo(18, 20, 21, 25); ctx.lineTo(21, 35); ctx.lineTo(25, 35); ctx.fill();
      ctx.fillStyle = '#f1c40f'; [[25, 30], [39, 30], [39, 50], [15, 25], [32, 15]].forEach(([x, y]) => ctx.fillRect(x, y, 2, 2));
      canvas.refresh();
  }

  private static generateArchway(scene: Phaser.Scene) {
      if (scene.textures.exists('obs_archway')) return;
      const W = 128, H = 128;
      const canvas = scene.textures.createCanvas('obs_archway', W, H);
      if (!canvas) return;
      const ctx = canvas.context;
      const cx = W / 2;
      const gradBase = ctx.createLinearGradient(0, 0, W, 0);
      gradBase.addColorStop(0, '#5d4037'); gradBase.addColorStop(0.4, '#8d6e63'); gradBase.addColorStop(1, '#4e342e'); 
      ctx.fillStyle = gradBase;
      ctx.beginPath(); ctx.moveTo(cx - 20, H); ctx.lineTo(cx - 20, 40); ctx.lineTo(cx - 25, 35); ctx.lineTo(cx + 25, 35); 
      ctx.lineTo(cx + 20, 40); ctx.lineTo(cx + 20, H); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx + 20, 45); ctx.quadraticCurveTo(cx + 50, 50, cx + 60, 80); 
      ctx.lineTo(cx + 55, 85); ctx.lineTo(cx + 58, 90); ctx.lineTo(cx + 40, 75);
      ctx.quadraticCurveTo(cx + 35, 60, cx + 20, 55); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(0, 150, 136, 0.4)'; ctx.fillRect(cx - 20, 50, 40, 10);
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)'; ctx.lineWidth = 2; ctx.strokeRect(cx - 20, 50, 40, 10);
      ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx - 10, H - 20); ctx.lineTo(cx - 5, H - 40); ctx.lineTo(cx - 12, H - 60); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 10, 40); ctx.lineTo(cx + 5, 60); ctx.stroke();
      const sandGrad = ctx.createLinearGradient(0, H - 20, 0, H);
      sandGrad.addColorStop(0, 'rgba(161, 136, 127, 0)'); sandGrad.addColorStop(1, '#a1887f');
      ctx.fillStyle = sandGrad; ctx.beginPath(); ctx.moveTo(cx - 35, H); ctx.quadraticCurveTo(cx - 25, H - 15, cx, H - 10);
      ctx.quadraticCurveTo(cx + 25, H - 15, cx + 35, H); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.beginPath(); ctx.moveTo(cx - 20, H); ctx.lineTo(cx - 20, 40); ctx.lineTo(cx - 25, 35); ctx.stroke();
      canvas.refresh();
  }

  private static generateScorpion(scene: Phaser.Scene) {
      if (scene.textures.exists('obs_scorpion')) return;
      const W = 64, H = 64;
      const canvas = scene.textures.createCanvas('obs_scorpion', W, H);
      if (!canvas) return;
      const ctx = canvas.context;
      const cx = W / 2; const ground = H;
      ctx.strokeStyle = '#212121'; ctx.lineWidth = 2;
      for (let i = -1; i <= 1; i++) {
          ctx.beginPath(); ctx.moveTo(cx - 5, ground - 10); ctx.lineTo(cx - 15 - (i*4), ground - 5); ctx.lineTo(cx - 20 - (i*5), ground); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(cx + 5, ground - 10); ctx.lineTo(cx + 15 + (i*4), ground - 5); ctx.lineTo(cx + 20 + (i*5), ground); ctx.stroke();
      }
      ctx.fillStyle = '#3e2723';
      ctx.beginPath(); ctx.ellipse(cx, ground - 12, 10, 6, 0, 0, Math.PI*2); ctx.fill();
      for(let i=0; i<3; i++) { ctx.beginPath(); ctx.ellipse(cx - (4+i*2), ground - 12 - (i*1), 4, 3, 0, 0, Math.PI*2); ctx.fill(); }
      ctx.fillStyle = '#4e342e';
      let tx = cx + 8; let ty = ground - 12;
      for(let i=0; i<5; i++) { ctx.beginPath(); ctx.arc(tx, ty, 3.5 - (i*0.3), 0, Math.PI*2); ctx.fill(); tx += Math.cos( -1.5 + (i*0.5) ) * 5; ty += Math.sin( -1.5 + (i*0.5) ) * 5; }
      ctx.fillStyle = '#d32f2f'; ctx.beginPath(); ctx.arc(tx, ty, 4, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx - 6, ty + 2); ctx.lineTo(tx + 2, ty + 2); ctx.fill();
      ctx.fillStyle = '#3e2723';
      ctx.beginPath(); ctx.ellipse(cx - 12, ground - 15, 6, 3, -0.5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + 12, ground - 15, 6, 3, 0.5, 0, Math.PI*2); ctx.fill();
      canvas.refresh();
  }

  private static generateViper(scene: Phaser.Scene) {
      if (scene.textures.exists('obs_viper')) return;
      const W = 64, H = 64;
      const canvas = scene.textures.createCanvas('obs_viper', W, H);
      if (!canvas) return;
      const ctx = canvas.context;
      const cx = W / 2; const ground = H;
      const cMain = '#d7ccc8'; const cPattern = '#5d4037';
      ctx.fillStyle = cMain; ctx.beginPath(); ctx.ellipse(cx, ground - 8, 18, 6, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = cPattern; ctx.beginPath(); ctx.arc(cx - 8, ground - 8, 3, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(cx + 5, ground - 7, 4, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = cMain; ctx.beginPath(); ctx.ellipse(cx + 2, ground - 16, 14, 5, 0, 0, Math.PI*2); ctx.fill();
      const hx = cx - 5; const hy = ground - 25;
      ctx.fillStyle = cMain; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + 12, hy - 5); ctx.lineTo(hx + 14, hy + 5); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = cPattern; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(hx + 8, hy - 3); ctx.lineTo(hx + 7, hy - 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(hx + 11, hy - 2); ctx.lineTo(hx + 12, hy - 7); ctx.stroke();
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(hx + 9, hy, 1, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#e53935'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(hx + 14, hy + 2); ctx.lineTo(hx + 18, hy + 4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(hx + 18, hy + 4); ctx.lineTo(hx + 20, hy + 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(hx + 18, hy + 4); ctx.lineTo(hx + 20, hy + 6); ctx.stroke();
      canvas.refresh();
  }

  private static generateArfaj(scene: Phaser.Scene) {
      if (scene.textures.exists('obs_arfaj')) return;
      const W = 64, H = 64;
      const canvas = scene.textures.createCanvas('obs_arfaj', W, H);
      if (!canvas) return;
      const ctx = canvas.context;
      const cx = W / 2;
      const bottomY = H;

      // Al-Arfaj: Silvery/Grey intricate branching bush. Brittle.
      const drawBranch = (x: number, y: number, len: number, angle: number, width: number, depth: number) => {
          if (depth > 4 || len < 4) return;

          const endX = x + Math.cos(angle) * len;
          const endY = y + Math.sin(angle) * len;

          // Gradient color based on depth: Brown base -> Silver tips
          ctx.strokeStyle = depth < 2 ? '#5d4037' : '#bdbdbd'; 
          ctx.lineWidth = width;
          ctx.lineCap = 'round';

          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // Thorns
          if (depth > 1) {
              ctx.fillStyle = '#cfd8dc'; // Whitish thorn
              const thorns = Math.max(1, Math.floor(len / 5));
              for(let i=0; i<thorns; i++) {
                  const t = Math.random();
                  const tx = x + (endX - x) * t;
                  const ty = y + (endY - y) * t;
                  ctx.beginPath();
                  ctx.moveTo(tx, ty);
                  // Perpendicular thorn
                  const ta = angle + (Math.random() > 0.5 ? Math.PI/2 : -Math.PI/2);
                  ctx.lineTo(tx + Math.cos(ta)*3, ty + Math.sin(ta)*3);
                  ctx.stroke();
              }
          }

          // Sub-branches (Spreading wide)
          const subCount = 2 + Math.floor(Math.random() * 2);
          for(let i=0; i<subCount; i++) {
              const spread = 0.8; // Wide spread
              const newAngle = angle + (Math.random() * spread - spread/2);
              drawBranch(endX, endY, len * 0.65, newAngle, width * 0.7, depth + 1);
          }

          // Sparse Leaves/Flowers (Very tiny)
          if (depth === 4 && Math.random() > 0.6) {
              ctx.fillStyle = '#fff59d'; // Faded yellow
              ctx.beginPath(); ctx.arc(endX, endY, 1.5, 0, Math.PI*2); ctx.fill();
          }
      };

      // Main stems radiating from ground
      const stems = 5;
      for(let i=0; i<stems; i++) {
          const angle = -Math.PI/2 + (i - stems/2) * 0.5 + (Math.random()*0.2 - 0.1);
          drawBranch(cx, bottomY, 15, angle, 3, 0);
      }

      canvas.refresh();
  }

  private static generateBookPile(scene: Phaser.Scene) {
      if (scene.textures.exists('obs_book_pile')) return;
      const W = 80, H = 80;
      const canvas = scene.textures.createCanvas('obs_book_pile', W, H);
      if (!canvas) return;
      const ctx = canvas.context;
      
      const cx = W/2;
      const bottomY = H;

      const drawBook = (x: number, y: number, w: number, h: number, color: string, angle: number) => {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(angle);
          
          ctx.fillStyle = color;
          ctx.fillRect(-w/2, -h, w, h);
          
          // Pages
          ctx.fillStyle = '#fffde7';
          ctx.fillRect(-w/2 + 3, -h + 2, w - 6, h - 4);
          
          // Spine
          ctx.fillStyle = 'rgba(0,0,0,0.2)';
          ctx.fillRect(-w/2, -h, 4, h);
          
          ctx.restore();
      };

      // Stack of books (messy)
      drawBook(cx, bottomY, 60, 15, '#d32f2f', 0); // Base Red
      drawBook(cx - 5, bottomY - 15, 50, 12, '#1976d2', 0.1); // Blue
      drawBook(cx + 2, bottomY - 27, 45, 14, '#388e3c', -0.05); // Green
      drawBook(cx, bottomY - 41, 40, 10, '#fbc02d', 0.2); // Yellow

      canvas.refresh();
  }
}
