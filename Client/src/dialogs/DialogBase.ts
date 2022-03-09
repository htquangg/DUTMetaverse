import Phaser from 'phaser';

export default class DialogBase extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    x?: number,
    y?: number,
    children?: Phaser.GameObjects.GameObject[],
  ) {
    super(scene, x, y, children);
    this.setDepth(10000);
  }

  public showMessageBox(text: string): void {
    const innerText = this.scene.add
      .text(0, 0, text)
      .setFontFamily('Aria')
      .setFontSize(12)
      .setColor('#000000');

    const dlgBoxWidth = innerText.width + 4;
    const dlgBoxHeight = innerText.height + 2;
    const dlgBoxX = this.x - dlgBoxWidth * 0.5;
    const dlgBoxY = this.y - this.height * 0.5;

    this.add(
      this.scene.add
        .graphics()
        .fillStyle(0xffffff, 1)
        .fillRoundedRect(dlgBoxX, dlgBoxY, dlgBoxWidth, dlgBoxHeight, 3)
        .strokeRoundedRect(dlgBoxX, dlgBoxY, dlgBoxWidth, dlgBoxHeight, 3),
    );

    this.add(innerText.setPosition(dlgBoxX + 2, dlgBoxY));
  }

  public clearMessagebox() {
    this.removeAll();
  }
}
