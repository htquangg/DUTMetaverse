import Phaser from 'phaser';
import { SceneType, AssetKey, PlayerKey } from '@tlq/types';

export default class Preload extends Phaser.Scene {
  constructor() {
    super(SceneType.PRELOAD);
  }

  preload() {
    this.load.image(
      AssetKey.BACKDROP_DAY,
      'assets/background/backdrop_day.png',
    );

    this.load.tilemapTiledJSON(AssetKey.TILEMAP, 'assets/map/map.json');

    this.load.spritesheet(
      AssetKey.TILES_WALL,
      'assets/map/FloorAndGround.png',
      {
        frameWidth: 32,
        frameHeight: 32,
      },
    );

    this.load.spritesheet(AssetKey.COMPUTER, 'assets/items/computer.png', {
      frameWidth: 96,
      frameHeight: 64,
    });

    this.load.spritesheet(AssetKey.WHITEBOARD, 'assets/items/whiteboard.png', {
      frameWidth: 64,
      frameHeight: 64,
    });

    this.load.spritesheet(AssetKey.CHAIR, 'assets/items/chair.png', {
      frameWidth: 32,
      frameHeight: 64,
    });

    this.load.spritesheet(PlayerKey.NANCY, 'assets/character/nancy.png', {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create() {
    // this.scene.start('game');
    this.launchBackground();
    this.launchGame();
  }

  launchBackground() {
    this.scene.launch(SceneType.BACKGROUND);
  }

  launchGame() {
    this.scene.launch(SceneType.GAME);
  }
}
