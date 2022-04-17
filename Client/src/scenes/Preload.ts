/* eslint-disable @typescript-eslint/no-var-requires */
import Phaser from 'phaser';
import { SceneType, AssetKey, PlayerKey } from '@tlq/types';
import { NetworkManager } from '@tlq/network';

export default class Preload extends Phaser.Scene {
  private _network!: NetworkManager;

  constructor() {
    super(SceneType.PRELOAD);
  }

  init() {
    this._network = NetworkManager.getInstance();
  }

  preload() {
    this.load.image(
      AssetKey.BACKDROP_DAY,
      require('../assets/background/backdrop_day.png'),
    );

    this.load.tilemapTiledJSON(
      AssetKey.TILEMAP,
      require('../assets/map/map.json'),
    );

    this.load.spritesheet(
      AssetKey.TILES_WALL,
      require('../assets/map/FloorAndGround.png'),
      {
        frameWidth: 32,
        frameHeight: 32,
      },
    );

    this.load.spritesheet(
      AssetKey.COMPUTER,
      require('../assets/items/computer.png'),
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );

    this.load.spritesheet(
      AssetKey.WHITEBOARD,
      require('../assets/items/whiteboard.png'),
      {
        frameWidth: 64,
        frameHeight: 64,
      },
    );

    this.load.spritesheet(
      AssetKey.CHAIR,
      require('../assets/items/chair.png'),
      {
        frameWidth: 32,
        frameHeight: 64,
      },
    );

    this.load.spritesheet(
      PlayerKey.NANCY,
      require('../assets/character/nancy.png'),
      {
        frameWidth: 32,
        frameHeight: 48,
      },
    );
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
    this._network
      .getUserMedia()
      .then((_userMedia) => {
        this._network.joinOrCreatePublic().then(() => {
          this.scene.launch(SceneType.GAME);
        });
      })
      .catch((err) => window.alert(err));
  }
}
