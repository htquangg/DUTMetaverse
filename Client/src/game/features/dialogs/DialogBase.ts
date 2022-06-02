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

  protected _show(text: string): void {
    // TODO
  }
  public show(text: string): void {
    this._show(text);
  }

  protected _hide(): void {
    this.removeAll(true);
  }
  public hide() {
    this._hide();
  }
}
