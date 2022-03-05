import Phaser from 'phaser';
import { SceneType } from '@tlq/types//Scene';

export default class Preload extends Phaser.Scene {
  constructor() {
    super(SceneType.PRELOAD);
  }

  preload() {
    this.load.tilemapTiledJSON('tilemap', 'assets/map/map.json');
    this.load.spritesheet('tiles_wall', 'assets/map/FloorAndGround.png', {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.spritesheet('nancy', 'assets/character/nancy.png', {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create() {
    this.scene.start('game');
  }
}
