import Phaser from 'phaser';

import Preload from './scenes/Preload';
import Game from './scenes/Game';
import Background from './scenes/Background';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
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
      debug: true,
    },
  },
  scene: [Preload, Background, Game],
};

export default new Phaser.Game(config);
