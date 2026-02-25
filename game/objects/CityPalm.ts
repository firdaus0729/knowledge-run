
import Phaser from 'phaser';

export class CityPalm extends Phaser.GameObjects.Container {
  declare add: (child: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]) => this;
  declare setDepth: (value: number) => this;
  declare setScale: (x: number, y?: number) => this;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    const tree = scene.add.sprite(0, 0, 'city_palm_tree');
    tree.setOrigin(0.5, 1);
    this.add(tree);

    // Slight sway animation
    scene.tweens.add({
      targets: tree,
      skewX: 0.03, // Subtle sway
      rotation: 0.02,
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.setDepth(9.5); 
    this.setScale(Phaser.Math.FloatBetween(0.8, 1.2));
  }

  static generateTexture(scene: Phaser.Scene) {
      if (scene.textures.exists('city_palm_tree')) return;
      const W = 300, H = 400; // Larger canvas for detail
      const canvas = scene.textures.createCanvas('city_palm_tree', W, H);
      if (!canvas) return;
      const ctx = canvas.context;
      const cx = W / 2;
      const trunkTopY = 100;

      // --- 1. TRUNK (Textured & Curved) ---
      // Draw path
      ctx.beginPath();
      ctx.moveTo(cx - 10, H); // Base Left
      ctx.lineTo(cx + 15, H); // Base Right
      // Curve up to top
      ctx.quadraticCurveTo(cx + 20, H / 2, cx + 5, trunkTopY); // Top Right
      ctx.lineTo(cx - 5, trunkTopY); // Top Left
      ctx.quadraticCurveTo(cx + 10, H / 2, cx - 10, H); // Back to bottom
      
      const trunkGrad = ctx.createLinearGradient(cx, trunkTopY, cx, H);
      trunkGrad.addColorStop(0, '#795548'); // Lighter top
      trunkGrad.addColorStop(1, '#3e2723'); // Darker bottom
      ctx.fillStyle = trunkGrad;
      ctx.fill();

      // Trunk Bark Texture (Diamond/Scale pattern)
      ctx.save();
      ctx.clip(); // Clip to trunk shape
      ctx.strokeStyle = '#3e2723';
      ctx.lineWidth = 1;
      for (let y = trunkTopY; y < H; y += 10) {
          ctx.beginPath();
          // Cross hatching to look like palm bark
          ctx.moveTo(cx - 20, y); ctx.lineTo(cx + 20, y + 5);
          ctx.moveTo(cx - 20, y + 5); ctx.lineTo(cx + 20, y);
          ctx.stroke();
      }
      // Shadow on left side
      const shadowGrad = ctx.createLinearGradient(cx - 10, 0, cx + 15, 0);
      shadowGrad.addColorStop(0, 'rgba(0,0,0,0.3)');
      shadowGrad.addColorStop(0.5, 'rgba(0,0,0,0)');
      shadowGrad.addColorStop(1, 'rgba(0,0,0,0.3)');
      ctx.fillStyle = shadowGrad;
      ctx.fillRect(cx - 20, trunkTopY, 50, H);
      ctx.restore();

      // --- 2. DATES (Fruit Clusters) ---
      // Under the leaves
      const drawDateCluster = (dx: number, dy: number) => {
          ctx.fillStyle = '#e65100'; // Orange/Brown
          for(let i=0; i<8; i++) {
              const ox = dx + Math.random()*15 - 7;
              const oy = dy + Math.random()*20;
              ctx.beginPath(); ctx.arc(ox, oy, 4, 0, Math.PI*2); ctx.fill();
          }
      };
      drawDateCluster(cx - 10, trunkTopY + 5);
      drawDateCluster(cx + 10, trunkTopY + 5);


      // --- 3. FRONDS (Detailed Leaves) ---
      // Helper to draw a complex frond
      const drawFrond = (angle: number, length: number, curvature: number) => {
          ctx.save();
          ctx.translate(cx, trunkTopY + 5);
          ctx.rotate(angle);

          // Draw Spine
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(length / 2, -curvature, length, 0);
          ctx.strokeStyle = '#1b5e20'; // Dark green spine
          ctx.lineWidth = 2;
          ctx.stroke();

          // Draw Leaflets (Individual blades)
          const leaflets = 15;
          for (let i = 0; i < leaflets; i++) {
              const t = i / leaflets;
              const lx = t * length;
              const ly = -4 * curvature * (t - t*t); // Point on curve
              
              const bladeLen = 20 + Math.random() * 10;
              
              // Leaf color gradient
              ctx.strokeStyle = t < 0.5 ? '#2e7d32' : '#43a047'; // Darker near base, lighter near tip
              ctx.lineWidth = 1.5;

              // Top blade
              ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + 5, ly - bladeLen); ctx.stroke();
              // Bottom blade
              ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + 5, ly + bladeLen * 0.5); ctx.stroke();
          }
          ctx.restore();
      };

      // Back layer (Darker)
      for (let i = 0; i < 5; i++) {
          const angle = Math.PI + (i * Math.PI / 4) - 0.5;
          drawFrond(angle, 110, 30);
      }

      // Front layer (Lighter/More vibrant)
      for (let i = 0; i < 4; i++) {
          const angle = Math.PI + (i * Math.PI / 3) - 0.2;
          drawFrond(angle, 100, 40);
      }
      
      // Crown center
      ctx.fillStyle = '#33691e';
      ctx.beginPath(); ctx.arc(cx, trunkTopY + 5, 8, 0, Math.PI*2); ctx.fill();

      canvas.refresh();
  }
}
