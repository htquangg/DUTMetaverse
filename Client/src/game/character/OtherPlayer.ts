import { EventMessage, EventParamsMap } from '@tlq/game/types';
import Phaser from 'phaser';
import { NetworkManager } from '@tlq/game/network';
import Player, { sittingShiftData } from './Player';
import { MyPlayer } from '.';
import { EventManager } from '../events';

export default class OtherPlayer extends Player {
  private _network!: NetworkManager;

  private _targetPosition: [number, number];
  private lastUpdateTimestamp?: number;
  private _playContainerBody: Phaser.Physics.Arcade.Body;

  private _connected: boolean;
  private _connectionBufferTime: number;

  private myPlayer?: MyPlayer;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string | Phaser.Textures.Texture,
    id: string,
    name: string,
    frame?: string | number,
  ) {
    super(scene, x, y, texture, id, frame);

    this._targetPosition = [x, y];

    this._playerName.setText(name);
    this._playContainerBody = this.playerContainer
      .body as Phaser.Physics.Arcade.Body;
    // this._playContainerBody.x = this._targetPosition[0] + 100;
    this.playerContainer.x = this.x;
    this.playerContainer.y = this.y;

    this._network = NetworkManager.getInstance();

    this._connected = false;
    this._connectionBufferTime = 0;
  }

  preUpdate(t: number, dt: number) {
    super.preUpdate(t, dt);

    // change player.depth based on player.y
    this.setDepth(this.y);

    if (this.lastUpdateTimestamp && t - this.lastUpdateTimestamp > 750) {
      this.lastUpdateTimestamp = t;
      this.x = this._targetPosition[0];
      this.y = this._targetPosition[1];
      this.playerContainer.x = this._targetPosition[0];
      this.playerContainer.y = this._targetPosition[1] - 30;
      return;
    }

    this.lastUpdateTimestamp = t;

    const animParts = this.anims.currentAnim?.key.split('_');

    const animState = animParts[1];
    if (animState === 'sit') {
      const animDir = animParts[2];
      const sittingShift = sittingShiftData[animDir];
      if (sittingShift) {
        // set hardcoded depth (differs between directions) if player sits down
        this.setDepth(this.depth + sittingShiftData[animDir][2]);
      }
    }

    const delta = (this.SPEED / 1000) * dt; // minimum distance that a player can move in a frame (dt is in unit of ms)
    let dx = this._targetPosition[0] - this.x;
    let dy = this._targetPosition[1] - this.y;

    // if the player is close enough to the target position, directly snap the player to that position
    if (Math.abs(dx) < delta) {
      this.x = this._targetPosition[0];
      this.playerContainer.x = this._targetPosition[0];
      dx = 0;
    }
    if (Math.abs(dy) < delta) {
      this.y = this._targetPosition[1];
      this.playerContainer.y = this._targetPosition[1] - 30;
      dy = 0;
    }

    // if the player is still far from target position, impose a constant velocity towards it
    let vx = 0;
    let vy = 0;
    if (dx > 0) vx += this.SPEED;
    else if (dx < 0) vx -= this.SPEED;
    if (dy > 0) vy += this.SPEED;
    else if (dy < 0) vy -= this.SPEED;

    // update character velocity
    this.setVelocity(vx, vy);
    this.body.velocity.setLength(this.SPEED);
    // also update playerNameContainer velocity
    this._playContainerBody.setVelocity(vx, vy);
    this._playContainerBody.velocity.setLength(this.SPEED);

    this._connectionBufferTime += dt;

    if (
      this._connected &&
      !this.body.embedded &&
      this.body.touching.none &&
      this._connectionBufferTime >= 750
    ) {
      // if (
      //   this.x < 610 &&
      //   this.y > 515 &&
      //   this.myPlayer!.x < 610 &&
      //   this.myPlayer!.y > 515
      // )
      //   return;
      EventManager.getInstance().emit(EventMessage.PLAYER_DISCONNECTED, {
        playerID: this._playerID,
      });
      // phaserEvents.emit(Event.PLAYER_DISCONNECTED, this.playerId);
      this._connectionBufferTime = 0;
      this._connected = false;
    }
  }

  destroy(fromScene: boolean) {
    this.playerContainer.destroy();
    super.destroy(fromScene);
  }

  updateRemote(
    field: string,
    value: EventParamsMap[EventMessage.PLAYER_UPDATED]['value'],
  ) {
    switch (field) {
      case 'name':
        if (typeof value === 'string') {
          // TODO
        }

        break;
      case 'x':
        if (typeof value === 'number') {
          this._targetPosition[0] = value;
          this.playerContainer.x = value;
        }
        break;
      case 'y':
        if (typeof value === 'number') {
          this._targetPosition[1] = value;
          this.playerContainer.y = value;
        }
        break;
      case 'anim':
        if (typeof value === 'string') {
          this.anims.play(value, true);
        }
        break;

      default:
        break;
    }
  }

  // public makeCall(myPlayer: MyPlayer): void {
  //   console.error('makecall: ', myPlayer._playerID, this._playerID);
  //   this.myPlayer = myPlayer;
  //   // const myPlayerId = myPlayer._playerID;
  //   if (!this._connected && this._connectionBufferTime >= 750) {
  //     this._connected = true;
  //     this._connectionBufferTime = 0;
  //     this._network.makeCall(myPlayer._playerID);
  //   }
  // }
}

declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      otherPlayer(
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        id: string,
        name: string,
        frame?: string | number,
      ): OtherPlayer;
    }
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  'otherPlayer',
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    x: number,
    y: number,
    texture: string | Phaser.Textures.Texture,
    id: string,
    name: string,
    frame?: string | number,
  ) {
    const sprite = new OtherPlayer(this.scene, x, y, texture, id, name, frame);

    this.displayList.add(sprite);
    this.updateList.add(sprite);

    this.scene.physics.world.enableBody(
      sprite,
      Phaser.Physics.Arcade.DYNAMIC_BODY,
    );

    return sprite;
  },
);
