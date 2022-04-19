/* eslint-disable @typescript-eslint/no-var-requires */
import Phaser from 'phaser';
import { SceneType, AssetKey, PlayerKey } from '@tlq/game/types';
import { NetworkManager } from '@tlq/game/network';
import Utils from '@tlq/game/utils';

export default class Preload extends Phaser.Scene {
  private _network!: NetworkManager;

  constructor() {
    super(SceneType.PRELOAD);
  }

  init() {
    this._network = NetworkManager.getInstance();
  }

  async create() {
    const { default: backdropDayPath } = await import(
      '../../assets/background/backdrop_day.png'
    );
    await Utils.asyncLoader(
      this.load.image(AssetKey.BACKDROP_DAY, backdropDayPath),
    );

    const { default: mapJson } = await import('../../assets/map/map.json');
    await Utils.asyncLoader(
      this.load.tilemapTiledJSON(AssetKey.TILEMAP, mapJson),
    );

    const { default: floorAndGroundPath } = await import(
      '../../assets/map/FloorAndGround.png'
    );
    await Utils.asyncLoader(
      this.load.spritesheet(AssetKey.TILES_WALL, floorAndGroundPath, {
        frameWidth: 32,
        frameHeight: 32,
      }),
    );

    const { default: computerPath } = await import(
      '../../assets/items/computer.png'
    );
    await Utils.asyncLoader(
      this.load.spritesheet(AssetKey.COMPUTER, computerPath, {
        frameWidth: 96,
        frameHeight: 64,
      }),
    );

    const { default: whiteboardPath } = await import(
      '../../assets/items/whiteboard.png'
    );
    await Utils.asyncLoader(
      this.load.spritesheet(AssetKey.WHITEBOARD, whiteboardPath, {
        frameWidth: 64,
        frameHeight: 64,
      }),
    );

    const { default: chairPath } = await import('../../assets/items/chair.png');
    await Utils.asyncLoader(
      this.load.spritesheet(AssetKey.CHAIR, chairPath, {
        frameWidth: 32,
        frameHeight: 64,
      }),
    );

    const { default: nancyPath } = await import(
      '../../assets/character/nancy.png'
    );
    await Utils.asyncLoader(
      this.load.spritesheet(PlayerKey.NANCY, nancyPath, {
        frameWidth: 32,
        frameHeight: 48,
      }),
    );

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
