import Phaser from 'phaser';
import ItemBase from '@tlq/items/ItemBase';
import { PlayerState, ItemType } from '@tlq/types';
import { Chair, Whiteboard, Computer } from '@tlq/items';

/**
 * shifting distance for sitting animation
 * format: direction: [xShift, yShift, depthShift]
 */
export const sittingShiftData = {
  up: [0, 3, -10],
  down: [0, 3, 1],
  left: [0, -8, 10],
  right: [0, -8, 10],
};

export default class Player extends Phaser.Physics.Arcade.Sprite {
  private _itemSelected?: ItemBase;
  public get itemSelected(): ItemBase | undefined {
    return this._itemSelected;
  }
  public set itemSelected(item: ItemBase | undefined) {
    this._itemSelected = item;
  }

  private _behavior: PlayerState = PlayerState.IDLE;
  public get behavior(): PlayerState {
    return this._behavior;
  }
  public set behavior(state: PlayerState) {
    this._behavior = state;
  }

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string | Phaser.Textures.Texture,
    frame?: string | number,
  ) {
    super(scene, x, y, texture, frame);

    this.anims.play('nancy_idle_down', true);
  }

  update(
    cursors: Phaser.Types.Input.Keyboard.CursorKeys,
    keyE: Phaser.Input.Keyboard.Key,
    keyR: Phaser.Input.Keyboard.Key,
  ) {
    if (!cursors) return;

    if (this.itemSelected) {
      if (!this.scene.physics.overlap(this, this.itemSelected)) {
        this.itemSelected.clearDialogBox();
        this.itemSelected = undefined;
      }
    }

    const itemType = this.itemSelected?.getType();

    if (Phaser.Input.Keyboard.JustDown(keyR)) {
      switch (itemType) {
        case ItemType.COMPUTER:
          const computer = this.itemSelected as Computer;
          computer.openDialog();
          break;
        case ItemType.WHITEBOARD:
          const whiteboard = this.itemSelected as Whiteboard;
          whiteboard.openDialog();
          break;
        default:
          break;
      }
    }

    switch (this.behavior) {
      case PlayerState.IDLE:
        if (
          Phaser.Input.Keyboard.JustDown(keyE) &&
          this.itemSelected?.getType() === ItemType.CHAIR
        ) {
          const chairItem = this.itemSelected as Chair;

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

                this.play(`nancy_sit_${chairItem.direction}`, true);
                // this.itemSelected = undefined;
              }
            },
            loop: false,
          });

          chairItem.clearDialogBox();
          chairItem.setDialogBox('Press E to leave');
          this.behavior = PlayerState.SITTING;
          return;
        }

        const speed = 800;

        if (cursors.up.isDown) {
          this.anims.play('nancy_run_up', true);
          this.setVelocity(0, -speed);
        } else if (cursors.down.isDown) {
          this.anims.play('nancy_run_down', true);
          this.setVelocity(0, speed);
        } else if (cursors.left.isDown) {
          this.anims.play('nancy_run_left', true);
          this.setVelocity(-speed, 0);
        } else if (cursors.right.isDown) {
          this.anims.play('nancy_run_right', true);
          this.setVelocity(speed, 0);
        } else {
          const parts = this.anims.currentAnim.key.split('_');
          parts[1] = 'idle';
          this.play(parts.join('_'));
          this.setVelocity(0, 0);
        }
        break;

      case PlayerState.SITTING:
        if (Phaser.Input.Keyboard.JustDown(keyE)) {
          const parts = this.anims.currentAnim.key.split('_');
          parts[1] = 'idle';
          this.play(parts.join('_'), true);
          this.itemSelected?.clearDialogBox();
          this.behavior = PlayerState.IDLE;
        }
        break;
    }
  }
}

declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      player(
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame?: string | number,
      ): Player;
    }
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  'player',
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    x: number,
    y: number,
    texture: string | Phaser.Textures.Texture,
    frame?: string | number,
  ) {
    var sprite = new Player(this.scene, x, y, texture, frame);

    this.displayList.add(sprite);
    this.updateList.add(sprite);

    this.scene.physics.world.enableBody(
      sprite,
      Phaser.Physics.Arcade.DYNAMIC_BODY,
    );

    return sprite;
  },
);
