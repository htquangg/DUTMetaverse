import Phaser from 'phaser';
import { PlayerState, ItemType, CustomCursorKeys } from '@tlq/game/types';
import { Chair, Whiteboard, Computer } from '@tlq/game/items';
import { NetworkManager } from '@tlq/game/network';
import PlayerSelector from './PlayerSelector';
import Player, { sittingShiftData } from './Player';

export default class MyPlayer extends Player {
  private _playContainerBody: Phaser.Physics.Arcade.Body;

  private _behavior: PlayerState = PlayerState.IDLE;
  public get behavior(): PlayerState {
    return this._behavior;
  }
  public set behavior(state: PlayerState) {
    this._behavior = state;
  }

  private _network!: NetworkManager;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string | Phaser.Textures.Texture,
    id: string,
    frame?: string | number,
  ) {
    super(scene, x, y, texture, id, frame);

    this._playContainerBody = this.playerContainer
      .body as Phaser.Physics.Arcade.Body;

    this._network = NetworkManager.getInstance();
  }

  update(playerSelector: PlayerSelector, cursors: CustomCursorKeys) {
    if (!cursors) return;

    const itemSelected = playerSelector.itemSelected;

    const itemType = itemSelected?.getType();

    if (Phaser.Input.Keyboard.JustDown(cursors.keyR)) {
      switch (itemType) {
        case ItemType.COMPUTER: {
          const computer = itemSelected as Computer;
          computer.openDialog(this._playerID);
          this.disableKeys();
          break;
        }
        case ItemType.WHITEBOARD: {
          const whiteboard = itemSelected as Whiteboard;
          whiteboard.openDialog(this._playerID);
          this.disableKeys();
          break;
        }
        default:
          break;
      }
    }

    switch (this.behavior) {
      case PlayerState.IDLE:
        if (
          Phaser.Input.Keyboard.JustDown(cursors.keyE) &&
          itemSelected?.getType() === ItemType.CHAIR
        ) {
          const chairItem = itemSelected as Chair;

          this.scene.time.addEvent({
            delay: 10,
            callback: () => {
              this.setVelocity(0, 0);
              if (chairItem.direction) {
                this.setPosition(
                  chairItem.x + sittingShiftData[chairItem.direction][0],
                  chairItem.y + sittingShiftData[chairItem.direction][1],
                ).setDepth(
                  chairItem.depth + sittingShiftData[chairItem.direction][2],
                );

                this._playContainerBody.setVelocity(0, 0);
                this.playerContainer.setPosition(
                  chairItem.x + sittingShiftData[chairItem.direction][0],
                  chairItem.y + sittingShiftData[chairItem.direction][1] - 30,
                );

                this.play(`${this._skin}_sit_${chairItem.direction}`, true);

                this._network.sendMsgUpdatePlayer(
                  this.x,
                  this.y,
                  this.anims.currentAnim.key,
                );
                // this.itemSelected = undefined;
              }
            },
            loop: false,
          });

          chairItem.hideInstructionDialog();
          chairItem.showInstructionDialog('Press E to leave');
          this.behavior = PlayerState.SITTING;
          return;
        }

        this._controlCursors(cursors);
        break;

      case PlayerState.SITTING:
        if (Phaser.Input.Keyboard.JustDown(cursors.keyE)) {
          const parts = this.anims.currentAnim.key.split('_');
          parts[1] = 'idle';
          this.play(parts.join('_'), true);
          itemSelected?.hideInstructionDialog();
          this.behavior = PlayerState.IDLE;

          this._network.sendMsgUpdatePlayer(
            this.x,
            this.y,
            this.anims.currentAnim.key,
          );
        }
        break;
    }
  }

  private _controlCursors(cursors: CustomCursorKeys) {
    if (cursors.up.isDown || cursors.keyK.isDown) {
      this._moveTop();
    } else if (cursors.down.isDown || cursors.keyJ.isDown) {
      this._moveBottom();
    } else if (cursors.left.isDown || cursors.keyH.isDown) {
      this._moveLeft();
    } else if (cursors.right.isDown || cursors.keyL.isDown) {
      this._moveRight();
    } else {
      this._stopMove();
    }

    this.body.velocity.setLength(this.SPEED);
    this._network.sendMsgUpdatePlayer(
      this.x,
      this.y,
      this.anims.currentAnim.key,
    );
  }

  private _moveTop() {
    this.anims.play(`${this._skin}_run_up`, true);
    this.setVelocity(0, -this.SPEED);
    this._playContainerBody.setVelocity(0, -this.SPEED);
  }

  private _moveBottom() {
    this.anims.play(`${this._skin}_run_down`, true);
    this.setVelocity(0, this.SPEED);
    this._playContainerBody.setVelocity(0, this.SPEED);
  }

  private _moveLeft() {
    this.anims.play(`${this._skin}_run_left`, true);
    this.setVelocity(-this.SPEED, 0);
    this._playContainerBody.setVelocity(-this.SPEED, 0);
  }

  private _moveRight() {
    this.anims.play(`${this._skin}_run_right`, true);
    this.setVelocity(this.SPEED, 0);
    this._playContainerBody.setVelocity(this.SPEED, 0);
  }

  private _stopMove() {
    const parts = this.anims.currentAnim.key.split('_');
    parts[1] = 'idle';
    // const newAnim = parts.join('_');

    // if (this.anims.currentAnim.key !== newAnim) {
    //   this.play(parts.join('_'));
    //   this._network.updatePlayer({
    //     x: this.x,
    //     y: this.y,
    //     anim: this.anims.currentAnim.key,
    //   });
    // }

    this.play(parts.join('_'));
    this.setVelocity(0, 0);
    this._playContainerBody.setVelocity(0, 0);
  }

  public disableKeys() {
    this.scene.input.keyboard.enabled = false;
  }

  public enableKeys() {
    this.scene.input.keyboard.enabled = true;
  }

  public setUserName(name: string) {
    this._playerName.setText(name);
    this._network.sendMsgPlayerChangeName(name);
    // EventManager.getInstance().emit(EventMessage.PLAYER_CHANGE_NAME, { name });
    // store.dispatch(pushPlayerJoinedMessage(name));
  }

  public setSKin(texture: string) {
    this._skin = texture;
    this.anims.play(`${this._skin}_idle_down`, true);
    this._network.sendMsgUpdatePlayer(this.x, this.y, texture);
    // EventManager.getInstance().emit(EventMessage.PLAYER_CHANGE_SKIN, {
    //   x: this.x,
    //   y: this.y,
    //   anim: this.anims.currentAnim.key,
    // });
  }
}

declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      myPlayer(
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        id: string,
        frame?: string | number,
      ): MyPlayer;
    }
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  'myPlayer',
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    x: number,
    y: number,
    texture: string | Phaser.Textures.Texture,
    id: string,
    frame?: string | number,
  ) {
    const sprite = new MyPlayer(this.scene, x, y, texture, id, frame);

    this.displayList.add(sprite);
    this.updateList.add(sprite);

    this.scene.physics.world.enableBody(
      sprite,
      Phaser.Physics.Arcade.DYNAMIC_BODY,
    );

    return sprite;
  },
);
