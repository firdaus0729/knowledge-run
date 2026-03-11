import Phaser from 'phaser';
import { Player } from '../objects/Player';
import { Obstacle } from '../objects/Obstacle';
import { Star } from '../objects/Star';
import { Heart } from '../objects/Heart';
import { ShieldItem } from '../objects/ShieldItem';
import { RewardBox } from '../objects/RewardBox';
import { MerchantCart } from '../objects/MerchantCart';
import { StackOfRugs } from '../objects/StackOfRugs';
import { StreetCat } from '../objects/StreetCat';
import { MagicCarpet } from '../objects/MagicCarpet';

/**
 * BootScene pre-generates heavy textures and shared assets
 * before the player reaches the main menu. This makes the
 * transition into MainScene feel instant.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    // Generate all procedural textures once, using this lightweight scene.
    Player.generateTexture(this);
    Obstacle.generateTextures(this);
    Star.generateTexture(this);
    Heart.generateTexture(this);
    ShieldItem.generateTexture(this);
    RewardBox.generateTexture(this);
    MerchantCart.generateTexture(this);
    StackOfRugs.generateTexture(this);
    StreetCat.generateTexture(this);
    MagicCarpet.init(this);

    // Immediately continue to the actual home/menu scene.
    this.scene.start('HomeScene');
  }
}

