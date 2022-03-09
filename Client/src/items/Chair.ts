import ItemBase from './ItemBase';
import { ItemType } from '@tlq/types';

export default class Chair extends ItemBase {
  private _direction?: string;

  public get direction(): string | undefined {
    return this._direction;
  }

  public set direction(direction: string | undefined) {
    this._direction = direction;
  }

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
    return ItemType.CHAIR;
  }

  public onOverlapDialog() {
    this.setDialogBox('Press E to sit');
  }
}
