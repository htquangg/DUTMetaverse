import Phaser from 'phaser';
import { ItemType } from '@tlq/types';
import { DialogBase } from '@tlq/dialogs';

export default class ItemBase extends Phaser.Physics.Arcade.Sprite {
  private dialogBase!: DialogBase;

  public getType(): ItemType {
    return ItemType.NONE;
  }

  public onOverlapDialog(): void {}
  public openDialog(): void {}

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string | Phaser.Textures.Texture,
    frame?: string | number,
  ) {
    super(scene, x, y, texture, frame);

    this.dialogBase = new DialogBase(
      this.scene,
      x,
      y,
      undefined,
      this.width,
      this.height,
    );
    this.scene.add.existing(this.dialogBase);
  }

  public showDialogBox(text: string): void {
    this.dialogBase.show(text);
  }

  public clearDialogBox(): void {
    this.dialogBase.clear();
  }
}
