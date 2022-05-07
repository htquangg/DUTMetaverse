import { DialogBase } from '.';

export default class StatusDialog extends DialogBase {
  protected _show(text: string): void {
    super._show(text);

    const innerText = this.scene.add
      .text(0, 0, text)
      .setFontFamily('Aria')
      .setFontSize(12)
      .setColor('#000000');

    const dlgBoxWidth = innerText.width + 4;
    const dlgBoxHeight = innerText.height + 2;
    const dlgBoxX = -dlgBoxWidth * 0.5;
    const dlgBoxY = - this.height * 0.5;

    this.add(
      this.scene.add
        .graphics()
        .fillStyle(0xffffff, 1)
        .fillRoundedRect(dlgBoxX, dlgBoxY, dlgBoxWidth, dlgBoxHeight, 3)
        .strokeRoundedRect(dlgBoxX, dlgBoxY, dlgBoxWidth, dlgBoxHeight, 3),
    );

    this.add(innerText.setPosition(dlgBoxX + 2, dlgBoxY));
  }

  protected _hide(): void {
    super._hide();
  }
}
