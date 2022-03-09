import Phaser from 'phaser';
import {
  SceneType,
  AssetKey,
  LayerKey,
  TilesetKey,
  PlayerKey,
  PlayerState,
} from '@tlq/types';
import { debugDraw } from '@tlq/utils';

import { createCharacterAnim } from '@tlq/anims';

import '@tlq/character';
import { Player } from '@tlq/character';

import { ItemBase, Chair, Computer, Whiteboard } from '@tlq/items';

export default class Game extends Phaser.Scene {
  private map!: Phaser.Tilemaps.Tilemap;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyE!: Phaser.Input.Keyboard.Key;
  private keyR!: Phaser.Input.Keyboard.Key;
  private keyH!: Phaser.Input.Keyboard.Key;
  private keyJ!: Phaser.Input.Keyboard.Key;
  private keyK!: Phaser.Input.Keyboard.Key;
  private keyL!: Phaser.Input.Keyboard.Key;
  private player!: Player;
  private items!: Phaser.Physics.Arcade.StaticGroup;

  constructor() {
    super(SceneType.GAME);
  }

  preload() {
    this.registerKey();
  }

  create() {
    createCharacterAnim(this.anims);

    this.createMap();

    const FloorAndGround = this.map.addTilesetImage(
      TilesetKey.FLOOR_AND_GROUND,
      AssetKey.TILES_WALL,
    );

    const wallLayer = this.map.createLayer(LayerKey.WALL, FloorAndGround);
    // const groundLayer = this.map.createLayer('Ground', FloorAndGround);

    this.map.createLayer(LayerKey.GROUND, FloorAndGround);

    wallLayer.setCollisionByProperty({ collides: true });
    // groundLayer.setCollisionByProperty({ collides: true });

    // debugDraw(wallLayer, this);
    // debugDraw(groundLayer, this);

    // import items objects
    const chairs = this.physics.add.staticGroup({ classType: Chair });
    const chairLayer = this.map.getObjectLayer(LayerKey.CHAIR);
    chairLayer.objects.forEach((chairObj) => {
      const item = this.addObjectFromTiled(
        chairs,
        chairObj,
        AssetKey.CHAIR,
        TilesetKey.CHAIR,
      ) as Chair;

      item.direction = chairObj.properties[0].value;
    });

    const computers = this.physics.add.staticGroup({ classType: Computer });
    const computersLayer = this.map.getObjectLayer(LayerKey.COMPUTER);
    computersLayer.objects.forEach((obj) => {
      const item = this.addObjectFromTiled(
        computers,
        obj,
        AssetKey.COMPUTER,
        TilesetKey.COMPUTER,
      ) as Computer;
      item.setDepth(item.y + item.height * 0.27);
    });

    const whiteboards = this.physics.add.staticGroup({ classType: Whiteboard });
    const whiteboardLayer = this.map.getObjectLayer(LayerKey.WHITEBOARD);
    whiteboardLayer.objects.forEach((obj, i) => {
      const item = this.addObjectFromTiled(
        whiteboards,
        obj,
        AssetKey.WHITEBOARD,
        TilesetKey.WHITEBOARD,
      ) as Whiteboard;
    });

    this.player = this.add.player(100, 100, PlayerKey.NANCY);

    this.cameras.main.startFollow(this.player);

    this.physics.add.collider(this.player, wallLayer);
    this.physics.add.overlap(
      this.player,
      [chairs, computers, whiteboards],
      this.handleItemSelectorOverlap,
      undefined,
      this,
    );
  }

  update(t: number, dt: number) {
    if (this.player) {
      this.player.update(this.cursors, this.keyE, this.keyR);
    }
  }

  createMap(): void {
    this.map = this.make.tilemap({ key: 'tilemap' });
  }

  registerKey(): void {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyE = this.input.keyboard.addKey('E');
    this.keyR = this.input.keyboard.addKey('R');
    this.keyH = this.input.keyboard.addKey('H');
    this.keyJ = this.input.keyboard.addKey('J');
    this.keyK = this.input.keyboard.addKey('K');
    this.keyL = this.input.keyboard.addKey('L');
    this.input.keyboard.disableGlobalCapture();
  }

  handleItemSelectorOverlap(
    obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody,
  ) {
    const player = obj1 as Player;
    const selectionItem = obj2 as ItemBase;

    const currentItem = player.itemSelected as ItemBase;
    if (currentItem) {
      if (currentItem === selectionItem) {
        return;
      }
      if (this.player.behavior !== PlayerState.SITTING) {
        currentItem.clearDialogBox();
      }
    }

    player.itemSelected = selectionItem;
    selectionItem.onOverlapDialog();
  }

  private addObjectFromTiled(
    group: Phaser.Physics.Arcade.StaticGroup,
    object: Phaser.Types.Tilemaps.TiledObject,
    key: AssetKey,
    tilesetName: TilesetKey,
  ) {
    const actualX = object.x! + object.width! * 0.5;
    const actualY = object.y! - object.height! * 0.5;
    const obj = group
      .get(
        actualX,
        actualY,
        key,
        object.gid! - this.map.getTileset(tilesetName).firstgid,
      )
      .setDepth(actualY);
    return obj;
  }
}
