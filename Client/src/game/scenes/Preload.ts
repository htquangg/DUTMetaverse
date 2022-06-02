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

  async preload() {
    // TODO
    await this._loadAsset();
  }

  async create() {
    this.launchBackground();
    this.launchGame();
  }

  launchBackground() {
    this.scene.launch(SceneType.BACKGROUND);
  }

  launchGame() {
    this._network.checkPreviousPermission();
    this._network.joinOrCreatePublic().then(() => {
      this.scene.launch(SceneType.GAME);
    });
  }

  private _loadBase64Image(props: {
    data: any;
    key: string;
    scene: Phaser.Scene;
  }) {
    return new Promise<void>((resolve) => {
      props.scene.textures.once(Phaser.Textures.Events.ADD, () => {
        this.load.spritesheet(props.key, props.data, {
          frameWidth: 96,
          frameHeight: 64,
        }),
          resolve();
      });
      props.scene.textures.addBase64(props.key, props.data);
    });
  }

  private async _loadAsset(): Promise<void> {
    this.load.image(
      AssetKey.BACKDROP_DAY,
      '../../assets/background/backdrop_day.png',
    );
    const { default: mapJson } = await import('../../assets/map/map.json');

    await Utils.asyncLoader(
      this.load.tilemapTiledJSON(AssetKey.TILEMAP, mapJson),
    );

    this.load.spritesheet(
      AssetKey.TILES_WALL,
      '../../assets/map/FloorAndGround.png',
      {
        frameWidth: 32,
        frameHeight: 32,
      },
    );
    this.load.spritesheet(AssetKey.GENERIC, '../../assets/items/Generic.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet(
      AssetKey.MORDERN_ITEM,
      '../../assets/items/Modern_Office_Black_Shadow.png',
      {
        frameWidth: 32,
        frameHeight: 32,
      },
    );
    this.load.spritesheet(
      AssetKey.WHITEBOARD,
      '../../assets/items/whiteboard.png',
      {
        frameWidth: 64,
        frameHeight: 64,
      },
    );

    this.load.spritesheet(
      AssetKey.COMPUTER,
      '../../assets/items/computer.png',
      {
        frameWidth: 96,
        frameHeight: 64,
      },
    );
    this.load.spritesheet(AssetKey.CHAIR, '../../assets/items/chair.png', {
      frameWidth: 32,
      frameHeight: 64,
    });
    await Utils.asyncLoader(
      this.load.spritesheet(
        PlayerKey.NANCY,
        '../../assets/character/nancy.png',
        {
          frameWidth: 32,
          frameHeight: 48,
        },
      ),
    );
    this.load.spritesheet(PlayerKey.ADAM, '../../assets/character/adam.png', {
      frameWidth: 32,
      frameHeight: 48,
    });

    this.load.spritesheet(PlayerKey.ASH, '../../assets/character/ash.png', {
      frameWidth: 32,
      frameHeight: 48,
    });

    this.load.spritesheet(PlayerKey.LUCY, '../../assets/character/lucy.png', {
      frameWidth: 32,
      frameHeight: 48,
    });
  }
}
