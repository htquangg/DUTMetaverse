import Phaser from 'phaser';
import MyPlayer from './MyPlayer';
import { PlayerState, CustomCursorKeys } from '@tlq/game/types';
import { ItemBase } from '@tlq/game/items';

export default class PlayerSelector extends Phaser.GameObjects.Zone {
  private _itemSelected?: ItemBase;

  public get itemSelected(): ItemBase | undefined {
    return this._itemSelected;
  }
  public set itemSelected(item: ItemBase | undefined) {
    this._itemSelected = item;
  }

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width?: number,
    height?: number,
  ) {
    super(scene, x, y, width, height);
    scene.physics.add.existing(this);
  }

  update(player: MyPlayer, cursors: CustomCursorKeys) {
    if (!cursors) return;

    if (player.behavior === PlayerState.SITTING) return;

    const { x, y } = player;

    if (cursors.left.isDown || cursors.keyH.isDown) {
      this.setPosition(x - 32, y);
    } else if (cursors.right.isDown || cursors.keyL.isDown) {
      this.setPosition(x + 32, y);
    } else if (cursors.up.isDown || cursors.keyK.isDown) {
      this.setPosition(x, y - 32);
    } else if (cursors.down.isDown || cursors.keyJ.isDown) {
      this.setPosition(x, y + 32);
    }

    if (this.itemSelected) {
      if (!this.scene.physics.overlap(this, this.itemSelected)) {
        this.itemSelected.hideInstructionDialog();
        this.itemSelected = undefined;
      }
    }
  }
}
