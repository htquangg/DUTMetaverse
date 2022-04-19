import Phaser from 'phaser';

import Preload from './scenes/Preload';
import Game from './scenes/Game';
import Background from './scenes/Background';

import 'regenerator-runtime/runtime';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'phaser-game',
  scale: {
    width: window.innerWidth,
    height: window.innerHeight,
    mode: Phaser.Scale.ScaleModes.RESIZE,
  },
  pixelArt: true, // Prevent pixel art from becoming blurred when scaled.
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [Preload, Background, Game],
};

export default new Phaser.Game(config);
