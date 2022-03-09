import Phaser from 'phaser';
import { ItemType } from '@tlq/types';

export default class ItemBase extends Phaser.Physics.Arcade.Sprite {
  private dialogBox!: Phaser.GameObjects.Container;

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

    this.dialogBox = this.scene.add.container().setDepth(10000);
  }

  public setDialogBox(text: string): void {
    const innerText = this.scene.add
      .text(0, 0, text)
      .setFontFamily('Aria')
      .setFontSize(12)
      .setColor('#000000');

    const dlgBoxWidth = innerText.width + 4;
    const dlgBoxHeight = innerText.height + 2;
    const dlgBoxX = this.x - dlgBoxWidth * 0.5;
    const dlgBoxY = this.y - this.height * 0.5;

    this.dialogBox.add(
      this.scene.add
        .graphics()
        .fillStyle(0xffffff, 1)
        .fillRoundedRect(dlgBoxX, dlgBoxY, dlgBoxWidth, dlgBoxHeight, 3)
        .strokeRoundedRect(dlgBoxX, dlgBoxY, dlgBoxWidth, dlgBoxHeight, 3),
    );

    this.dialogBox.add(innerText.setPosition(dlgBoxX + 2, dlgBoxY));
  }

  public clearDialogBox(): void {
    this.dialogBox.removeAll(true);
  }
}
