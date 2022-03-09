import ItemBase from './ItemBase';
import { ItemType } from '@tlq/types';

export default class Computer extends ItemBase {
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
    return ItemType.COMPUTER;
  }

  public onOverlapDialog(): void {
    this.setDialogBox('Press R to use computer');
  }

  public openDialog() {}
}
