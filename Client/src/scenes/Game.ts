import Phaser from 'phaser';
import * as Colyseus from 'colyseus.js';
import {
  SceneType,
  AssetKey,
  LayerKey,
  TilesetKey,
  PlayerKey,
  PlayerState,
  CustomCursorKeys,
} from '@tlq/types';
import { debugDraw, createCursorKeys } from '@tlq/utils';

import { createCharacterAnim } from '@tlq/anims';

import '@tlq/character';
import { Player, PlayerSelector } from '@tlq/character';

import { ItemBase, Chair, Computer, Whiteboard } from '@tlq/items';

export default class Game extends Phaser.Scene {
  private map!: Phaser.Tilemaps.Tilemap;

  private cursors!: CustomCursorKeys;

  private player!: Player;
  private playerSelector!: PlayerSelector;

  private items!: Phaser.Physics.Arcade.StaticGroup;

  private client!: Colyseus.Client;

  constructor() {
    super(SceneType.GAME);
  }

  async init() {
    this.client = new Colyseus.Client('ws://localhost:3000');
    const room = await this.client.joinOrCreate('my_room');
    console.log(room)
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
    this.playerSelector = new PlayerSelector(this, 0, 0, 16, 16);

    this.cameras.main.startFollow(this.player);

    this.physics.add.collider(this.player, wallLayer);
    this.physics.add.overlap(
      this.playerSelector,
      [chairs, computers, whiteboards],
      this.handleItemSelectorOverlap,
      undefined,
      this,
    );
  }

  update(t: number, dt: number) {
    if (this.player) {
      this.playerSelector.update(this.player, this.cursors);
      this.player.update(this.playerSelector, this.cursors);
    }
  }

  createMap(): void {
    this.map = this.make.tilemap({ key: 'tilemap' });
  }

  registerKey(): void {
    this.cursors = createCursorKeys(this);
    this.input.keyboard.disableGlobalCapture();
  }

  handleItemSelectorOverlap(
    obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody,
  ) {
    const playerSelector = obj1 as PlayerSelector;
    const selectionItem = obj2 as ItemBase;

    if (playerSelector && playerSelector.itemSelected) {
      const currentItem = playerSelector.itemSelected as ItemBase;

      if (currentItem === selectionItem) {
        return;
      }
    }

    playerSelector.itemSelected = selectionItem;
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
