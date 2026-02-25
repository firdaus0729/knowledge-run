import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';
import { HomeScene } from './scenes/HomeScene';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';

export const createGame = (
    containerId: string, 
    onScoreUpdate: (data: { distance: number; stars: number; hearts: number; isGameOver: boolean }) => void
) => {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: containerId,
    width: Math.max(10, GAME_WIDTH),
    height: Math.max(10, GAME_HEIGHT),
    backgroundColor: '#1a1625',
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: {
            width: 320,
            height: 240
        }
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0, x: 0 }, 
        debug: false,
      },
    },
    // MainScene handles the Gate logic now, NoorScene removed
    scene: [HomeScene, new MainScene(onScoreUpdate)],
    fps: {
      target: 60,
    }
  };

  return new Phaser.Game(config);
};