import { EventMessage, EventParamsMap } from '@tlq/game/types';
import Phaser from 'phaser';
import Player, { sittingShiftData } from './Player';

export default class OtherPlayer extends Player {
  private _targetPosition: [number, number];
  private lastUpdateTimestamp?: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string | Phaser.Textures.Texture,
    id: string,
    frame?: string | number,
  ) {
    super(scene, x, y, texture, id, frame);
    this._targetPosition = [x, y];
  }

  preUpdate(t: number, dt: number) {
    super.preUpdate(t, dt);

    // change player.depth based on player.y
    this.setDepth(this.y);

    if (this.lastUpdateTimestamp && t - this.lastUpdateTimestamp > 750) {
      this.lastUpdateTimestamp = t;
      this.x = this._targetPosition[0];
      this.y = this._targetPosition[1];
      return;
    }

    this.lastUpdateTimestamp = t;

    const animParts = this.anims.currentAnim.key.split('_');
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
      dx = 0;
    }
    if (Math.abs(dy) < delta) {
      this.y = this._targetPosition[1];
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
  }

  destroy(fromScene: boolean) {
    super.destroy(fromScene);
  }

  updateRemote(
    field: string,
    value: EventParamsMap[EventMessage.PLAYER_UPDATED]['value'],
  ) {
    switch (field) {
      case 'name':
        if (typeof value === 'string') {
        }

        break;
      case 'x':
        if (typeof value === 'number') {
          this._targetPosition[0] = value;
        }
        break;
      case 'y':
        if (typeof value === 'number') {
          this._targetPosition[1] = value;
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
}

declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      otherPlayer(
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
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
    frame?: string | number,
  ) {
    var sprite = new OtherPlayer(this.scene, x, y, texture, id, frame);

    this.displayList.add(sprite);
    this.updateList.add(sprite);

    this.scene.physics.world.enableBody(
      sprite,
      Phaser.Physics.Arcade.DYNAMIC_BODY,
    );

    return sprite;
  },
);