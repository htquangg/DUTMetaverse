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
import { PlayerSelector, MyPlayer, OtherPlayer } from '@tlq/character';

import { ItemBase, Chair, Computer, Whiteboard } from '@tlq/items';

import { NetworkManager } from '@tlq/network';
import { RoomState, IPlayer } from '@tlq/types';

export default class Game extends Phaser.Scene {
  private _map!: Phaser.Tilemaps.Tilemap;

  private _cursors!: CustomCursorKeys;

  private _myPlayer!: MyPlayer;
  private _playerSelector!: PlayerSelector;
  private _otherPlayers!: Phaser.Physics.Arcade.Group;
  private _otherPlayerMap!: Map<string, OtherPlayer>;

  private items!: Phaser.Physics.Arcade.StaticGroup;

  private _network!: NetworkManager;

  constructor() {
    super(SceneType.GAME);
  }

  preload() {
    this.registerKey();
  }

  create() {
    this._network = NetworkManager.getIntance();

    createCharacterAnim(this.anims);

    this.createMap();

    const FloorAndGround = this._map.addTilesetImage(
      TilesetKey.FLOOR_AND_GROUND,
      AssetKey.TILES_WALL,
    );

    const wallLayer = this._map.createLayer(LayerKey.WALL, FloorAndGround);
    // const groundLayer = this.map.createLayer('Ground', FloorAndGround);

    this._map.createLayer(LayerKey.GROUND, FloorAndGround);

    wallLayer.setCollisionByProperty({ collides: true });
    // groundLayer.setCollisionByProperty({ collides: true });

    // debugDraw(wallLayer, this);
    // debugDraw(groundLayer, this);

    // import items objects
    const chairs = this.physics.add.staticGroup({ classType: Chair });
    const chairLayer = this._map.getObjectLayer(LayerKey.CHAIR);
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
    const computersLayer = this._map.getObjectLayer(LayerKey.COMPUTER);
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
    const whiteboardLayer = this._map.getObjectLayer(LayerKey.WHITEBOARD);
    whiteboardLayer.objects.forEach((obj, i) => {
      const item = this.addObjectFromTiled(
        whiteboards,
        obj,
        AssetKey.WHITEBOARD,
        TilesetKey.WHITEBOARD,
      ) as Whiteboard;
    });

    this._myPlayer = this.add.myPlayer(
      100,
      100,
      PlayerKey.NANCY,
      this._network.sessionID,
    );
    this._playerSelector = new PlayerSelector(this, 0, 0, 16, 16);
    this._otherPlayers = this.physics.add.group({ classType: OtherPlayer });

    this._otherPlayerMap = new Map<string, OtherPlayer>();

    this.cameras.main.startFollow(this._myPlayer);

    this.physics.add.collider(this._myPlayer, wallLayer);
    this.physics.add.overlap(
      this._playerSelector,
      [chairs, computers, whiteboards],
      this.handleItemSelectorOverlap,
      undefined,
      this,
    );

    // register network event listeners
    this._registerNetworkListener();
  }

  update(t: number, dt: number) {
    if (this._myPlayer) {
      this._playerSelector.update(this._myPlayer, this._cursors);
      this._myPlayer.update(this._playerSelector, this._cursors);
    }
  }

  createMap(): void {
    this._map = this.make.tilemap({ key: 'tilemap' });
  }

  registerKey(): void {
    this._cursors = createCursorKeys(this);
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
        object.gid! - this._map.getTileset(tilesetName).firstgid,
      )
      .setDepth(actualY);
    return obj;
  }

  private _registerNetworkListener(): void {
    this._network.onPlayerJoined(this._handlePlayerJoined, this);
    this._network.onPlayerUpdated(this._handlePlayerUpdated, this);
    this._network.onPlayerLeft(this._handlePlayerLeft, this);
  }

  private _handlePlayerJoined(player: IPlayer, id: string) {
    console.log('[Game] hanle player joined!!!', player, id);
    const otherPlayer = this.add.otherPlayer(
      player.x,
      player.y,
      PlayerKey.NANCY,
      id,
    );
    this._otherPlayers.add(otherPlayer);
    this._otherPlayerMap.set(id, otherPlayer);
  }

  private _handlePlayerUpdated(
    field: string,
    value: number | string,
    id: string,
  ) {
    const otherPlayer = this._otherPlayerMap.get(id);
    otherPlayer?.updateRemote(field, value);
  }

  private _handlePlayerLeft(id: string) {
    if (this._otherPlayerMap.has(id)) {
      const otherPlayer = this._otherPlayerMap.get(id);
      if (!otherPlayer) return;
      this._otherPlayers.remove(otherPlayer, true, true);
      this._otherPlayerMap.delete(id);
    }
  }
}
