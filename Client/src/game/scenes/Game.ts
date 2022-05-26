import Phaser from 'phaser';
import {
  SceneType,
  AssetKey,
  LayerKey,
  TilesetKey,
  PlayerKey,
  CustomCursorKeys,
  ItemType,
  EventMessage,
  EventParamsMap,
} from '@tlq/game/types';
import { debugDraw, createCustomCursorKeys } from '@tlq/game/utils';

import { createCharacterAnim } from '@tlq/game/anims';

import '@tlq/game/character';
import { PlayerSelector, MyPlayer, OtherPlayer } from '@tlq/game/character';

import { ItemBase, Chair, Computer, Whiteboard } from '@tlq/game/items';

import { NetworkManager } from '@tlq/game/network';
import { RoomState, IPlayer } from '@tlq/game/types';

export default class Game extends Phaser.Scene {
  private _map!: Phaser.Tilemaps.Tilemap;

  private _cursors!: CustomCursorKeys;

  private _wallLayer!: Phaser.Tilemaps.TilemapLayer;

  private _chairs!: Phaser.Physics.Arcade.StaticGroup;
  private _computers!: Phaser.Physics.Arcade.StaticGroup;
  private _whiteboards!: Phaser.Physics.Arcade.StaticGroup;

  private _myPlayer!: MyPlayer;
  private _playerSelector!: PlayerSelector;
  private _otherPlayers!: Phaser.Physics.Arcade.Group;
  private _otherPlayerMap!: Map<string, OtherPlayer>;

  public _computerMap!: Map<string, Computer>;
  private _whiteboardMap!: Map<string, Whiteboard>;

  private _network!: NetworkManager;

  constructor() {
    super(SceneType.GAME);
  }

  preload() {
    this._registerKey();
  }

  create() {
    this._network = NetworkManager.getInstance();

    createCharacterAnim(this.anims);

    this._createMap();

    // create game objects
    this._myPlayer = this.add.myPlayer(
      100,
      100,
      PlayerKey.NANCY,
      this._network.sessionID,
    );
    this._playerSelector = new PlayerSelector(this, 0, 0, 16, 16);
    this._otherPlayers = this.physics.add.group({ classType: OtherPlayer });

    // create map objects
    this._createMapObjects();

    // create map layers
    this._createMapLayers();

    // register network event listeners
    this._registerNetworkListener();

    // handle objects collisions
    this.physics.add.collider(
      [this._myPlayer, this._myPlayer.playerContainer],
      this._wallLayer,
      this._handlePlayerWallCollision,
      undefined,
      this,
    );

    this.physics.add.overlap(
      this._playerSelector,
      [this._chairs, this._computers, this._whiteboards],
      this._handleItemSelectorOverlap,
      undefined,
      this,
    );

    // handle camera
    this.cameras.main.startFollow(this._myPlayer);
  }

  update(t: number, dt: number) {
    if (this._myPlayer) {
      this._playerSelector.update(this._myPlayer, this._cursors);
      this._myPlayer.update(this._playerSelector, this._cursors);
    }
  }

  private _registerKey(): void {
    this._cursors = createCustomCursorKeys(this);
    this.input.keyboard.disableGlobalCapture();
  }

  private _createMap(): void {
    this._map = this.make.tilemap({ key: 'tilemap' });
  }

  private _addGroupFromTiled(
    objectLayerName: string,
    key: string,
    tilesetName: string,
    collidable: boolean,
  ) {
    const group = this.physics.add.staticGroup();
    const objectLayer = this._map.getObjectLayer(objectLayerName);
    objectLayer.objects.forEach((object) => {
      const actualX = object.x! + object.width! * 0.5;
      const actualY = object.y! - object.height! * 0.5;
      console.log('@@@ object: ', object.y, object.height, actualY);
      group
        .get(
          actualX,
          actualY,
          key,
          object.gid! - this._map.getTileset(tilesetName).firstgid,
        )
        .setDepth(actualY);
    });
    if (this._myPlayer && collidable) {
      this.physics.add.collider(
        [this._myPlayer, this._myPlayer.playerContainer],
        group,
      );
    }
  }

  private _createMapLayers(): void {
    const FloorAndGround = this._map.addTilesetImage(
      TilesetKey.FLOOR_AND_GROUND,
      AssetKey.TILES_WALL,
    );

    this._wallLayer = this._map.createLayer(LayerKey.WALL, FloorAndGround);
    // const groundLayer = this.map.createLayer('Ground', FloorAndGround);

    this._map.createLayer(LayerKey.GROUND, FloorAndGround);

    this._wallLayer.setCollisionByProperty({ collides: true });
    // groundLayer.setCollisionByProperty({ collides: true });

    // debugDraw(wallLayer, this);
    // debugDraw(groundLayer, this);

    this._addGroupFromTiled(
      LayerKey.GENERIC,
      AssetKey.GENERIC,
      TilesetKey.GENERIC,
      false,
    );

    this._addGroupFromTiled(
      LayerKey.WALL,
      AssetKey.TILES_WALL,
      TilesetKey.FLOOR_AND_GROUND,
      true,
    );
    // import items objects
    this._chairs = this.physics.add.staticGroup({ classType: Chair });
    const chairLayer = this._map.getObjectLayer(LayerKey.CHAIR);
    chairLayer.objects.forEach((chairObj) => {
      const item = this._addObjectFromTiled(
        this._chairs,
        chairObj,
        AssetKey.CHAIR,
        TilesetKey.CHAIR,
      ) as Chair;

      console.log('chair: ', chairObj);

      item.direction = chairObj.properties[0].value;
    });

    this._computers = this.physics.add.staticGroup({ classType: Computer });
    const computersLayer = this._map.getObjectLayer(LayerKey.COMPUTER);
    computersLayer.objects.forEach((obj, idx) => {
      const item = this._addObjectFromTiled(
        this._computers,
        obj,
        AssetKey.COMPUTER,
        TilesetKey.COMPUTER,
      ) as Computer;

      item.setDepth(item.y + item.height * 0.27);
      item.id = idx.toString();
      this._computerMap.set(item.id, item);
    });

    this._whiteboards = this.physics.add.staticGroup({ classType: Whiteboard });
    const whiteboardLayer = this._map.getObjectLayer(LayerKey.WHITEBOARD);
    whiteboardLayer.objects.forEach((obj, idx) => {
      const item = this._addObjectFromTiled(
        this._whiteboards,
        obj,
        AssetKey.WHITEBOARD,
        TilesetKey.WHITEBOARD,
      ) as Whiteboard;

      item.id = idx.toString();
      this._whiteboardMap.set(item.id, item);
    });
  }

  private _createMapObjects(): void {
    this._otherPlayerMap = new Map<string, OtherPlayer>();
    this._computerMap = new Map<string, Computer>();
    this._whiteboardMap = new Map<string, Whiteboard>();
  }

  private _addObjectFromTiled(
    group: Phaser.Physics.Arcade.StaticGroup,
    object: Phaser.Types.Tilemaps.TiledObject,
    key: AssetKey,
    tilesetName: TilesetKey,
  ): ItemBase {
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

  private _handleItemSelectorOverlap(
    obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody,
  ): void {
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

  private _handlePlayerWallCollision(
    obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    _obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody,
  ) {
    if (obj1 instanceof Phaser.GameObjects.Container) {
      const leftDown = this._cursors.left?.isDown || this._cursors.keyH.isDown;
      const rightDown =
        this._cursors.right?.isDown || this._cursors.keyL.isDown;
      const upDown = this._cursors.up?.isDown || this._cursors.keyK.isDown;
      const downDown = this._cursors.down?.isDown || this._cursors.keyJ.isDown;

      const playerContainer = obj1 as Phaser.GameObjects.Container;
      const playerContainerBody =
        playerContainer.body as Phaser.Physics.Arcade.Body;

      if (leftDown) {
        // playerContainerBody.offset.x = 0;
      } else if (rightDown) {
        // TODO
      } else if (upDown) {
        // console.log('offset: ', playerContainerBody.);
        // playerContainer.y = 30;
        playerContainerBody.setVelocity(0, 0);
      } else if (downDown) {
        // TODO
      } else {
        // TODO
      }

      if (leftDown || rightDown || upDown || downDown) {
        // this.activeChest = undefined;
      }
    }
  }

  private _registerNetworkListener(): void {
    this._network.onPlayerJoined(this._handlePlayerJoined, this);
    this._network.onPlayerUpdated(this._handlePlayerUpdated, this);
    this._network.onPlayerLeft(this._handlePlayerLeft, this);

    this._network.onItemAddUser(this._handleItemAddUser, this);
    this._network.onItemRemoveUser(this._handleItemRemoveUser, this);

    this._network.onPlayerConnectComputer(
      this._handlePlayerConnectComputer,
      this,
    );
    this._network.onPlayerConnectWhiteboard(
      this._handlePlayerConnectWhiteboard,
      this,
    );
  }

  private _handlePlayerJoined<
    T extends EventParamsMap[EventMessage.PLAYER_JOINED],
  >(msg: T) {
    const { player, playerID } = msg;
    const otherPlayer = this.add.otherPlayer(
      player.x,
      player.y,
      PlayerKey.NANCY,
      playerID,
      player.name,
    );
    this._otherPlayers.add(otherPlayer);
    this._otherPlayerMap.set(playerID, otherPlayer);
    console.log('[Game] hanle player joined!!!', msg.player, msg.playerID);
  }

  private _handlePlayerUpdated<
    T extends EventParamsMap[EventMessage.PLAYER_UPDATED],
  >(msg: T): void {
    const { playerID, field, value } = msg;
    const otherPlayer = this._otherPlayerMap.get(playerID);
    if (otherPlayer) {
      otherPlayer.updateRemote(field, value);
    }
  }

  private _handlePlayerLeft<T extends EventParamsMap[EventMessage.PLAYER_LEFT]>(
    msg: T,
  ): void {
    const { playerID } = msg;
    if (this._otherPlayerMap.has(playerID)) {
      const otherPlayer = this._otherPlayerMap.get(playerID);
      if (!otherPlayer) return;
      this._otherPlayers.remove(otherPlayer, true, true);
      this._otherPlayerMap.delete(playerID);
    }
  }

  private _handleItemAddUser<
    T extends EventParamsMap[EventMessage.ITEM_ADD_USER],
  >(msg: T) {
    const { playerID, itemID, itemType } = msg;

    switch (itemType) {
      case ItemType.COMPUTER:
        const computer = this._computerMap.get(itemID);
        if (computer) {
          computer.addCurrentUser(playerID);
        }
        break;
      case ItemType.WHITEBOARD:
        const whiteboard = this._whiteboardMap.get(itemID);
        if (whiteboard) {
          whiteboard.addCurrentUser(playerID);
        }
        break;
      default:
        break;
    }
  }

  private _handleItemRemoveUser<
    T extends EventParamsMap[EventMessage.ITEM_REMOVE_USER],
  >(msg: T) {
    const { playerID, itemID, itemType } = msg;

    switch (itemType) {
      case ItemType.COMPUTER:
        const computer = this._computerMap.get(itemID);
        if (computer) {
          computer.removeCurrentUsers(playerID);
        }
        break;
      case ItemType.WHITEBOARD:
        const whiteboard = this._whiteboardMap.get(itemID);
        if (whiteboard) {
          whiteboard.removeCurrentUsers(playerID);
        }
        break;
      default:
        break;
    }
  }

  private _handlePlayerConnectComputer<
    T extends EventParamsMap[EventMessage.CONNECT_TO_COMPUTER],
  >(msg: T): void {
    console.error('[GameScene] handlePlayerConnectComputer');
    this._network.sendMsgPlayerConnectComputer(msg.computerID);
  }

  private _handlePlayerConnectWhiteboard<
    T extends EventParamsMap[EventMessage.CONNECT_TO_WHITEBOARD],
  >(msg: T): void {
    console.error('[GameScene] handlePlayerConnectWhiteboard.');
    this._network.sendMsgPlayerConnectWhiteboard(msg.whiteboardID);
  }

  public leave(): void {
    this._network.disconnect();
  }

  public async getUserMedia(): Promise<MediaStream> {
    return this._network.getUserMedia();
  }

  public setNamePlayer(name: string): void {
    this._myPlayer.setUserName(name);
  }

  public setSkinPlayer(skin: string): void {
    this._myPlayer.setSKin(skin);
  }

  public startShareScreen(itemID: string): void {
    console.error('[GameScene] user start share screen.');
    this._network.startShareScreen(itemID);
  }

  public stopShareScreen(itemID: string): void {
    console.error('[GameScene] user stop share screen.');
    this._network.stopShareScreen(itemID);
  }

  public connectToComputer() {
    // TODO
  }

  public disconnectFromComputer(computerID: string) {
    this._network.sendMsgPlayerDisconnectFromComputer(computerID);
  }

  public connectToWhiteboard() {
    // TODO
  }

  public disconnectFromWhiteboard(whiteboardID: string) {
    this._network.sendMsgPlayerDisconnectFromWhiteboard(whiteboardID);
  }
  public disableKeys() {
    this.input.keyboard.enabled = false;
  }

  public enableKeys() {
    this.input.keyboard.enabled = true;
  }
}
