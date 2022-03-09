import ItemBase from './ItemBase';
import { ItemType } from '@tlq/types';

export default class Whiteboard extends ItemBase {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string | Phaser.Textures.Texture,
    frame?: string | number,
  ) {
    super(scene, x, y, texture, frame);
  }

  public getType(): ItemType {
    return ItemType.WHITEBOARD;
  }

  public onOverlapDialog() {
    this.showDialogBox('Press R to use whiteboard');
  }

  public openDialog() {}
}
