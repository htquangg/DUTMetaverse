import Phaser from 'phaser';

export default class DialogBase extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    x?: number,
    y?: number,
    children?: Phaser.GameObjects.GameObject[],
    width?: number,
    height?: number,
  ) {
    super(scene, x, y, children);
    this.setDepth(10000);

    if (width && height) {
      this.setSize(width, height);
    }
  }

  public show(text: string): void {
    const innerText = this.scene.add
      .text(0, 0, text)
      .setFontFamily('Aria')
      .setFontSize(12)
      .setColor('#000000');

    const dlgBoxWidth = innerText.width + 4;
    const dlgBoxHeight = innerText.height + 2;
    const dlgBoxX = -dlgBoxWidth * 0.5;
    const dlgBoxY = -this!.height * 0.5;

    this.add(
      this.scene.add
        .graphics()
        .fillStyle(0xffffff, 1)
        .fillRoundedRect(dlgBoxX, dlgBoxY, dlgBoxWidth, dlgBoxHeight, 3)
        .strokeRoundedRect(dlgBoxX, dlgBoxY, dlgBoxWidth, dlgBoxHeight, 3),
    );

    this.add(innerText.setPosition(dlgBoxX + 2, dlgBoxY));
  }

  public clear(): void {
    this.removeAll(true);
  }
}
