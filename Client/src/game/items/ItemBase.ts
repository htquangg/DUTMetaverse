import Phaser from 'phaser';
import { ItemType } from '@tlq/game/types';
import { InstructionDialog, StatusDialog } from '@tlq/game/features/dialogs';

export default class ItemBase extends Phaser.Physics.Arcade.Sprite {
  private _instructionDialog!: InstructionDialog;
  private _statusDialog!: StatusDialog;

  public getType(): ItemType {
    return ItemType.NONE;
  }

  // must implement
  public onOverlapDialog(): void {
    // TODO
  }
  public openDialog(playerID: string): void {
    // TODO
  }

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string | Phaser.Textures.Texture,
    frame?: string | number,
  ) {
    super(scene, x, y, texture, frame);

    this._instructionDialog = new InstructionDialog(
      this.scene,
      x,
      y,
      undefined,
      this.width,
      this.height,
    );

    this._statusDialog = new StatusDialog(
      this.scene,
      x,
      y,
      undefined,
      this.width,
      this.height,
    );

    this.scene.add.existing(this._instructionDialog);
    this.scene.add.existing(this._statusDialog);
  }


  public showInstructionDialog(text: string): void {
    this._instructionDialog.show(text);
  }

  public hideInstructionDialog(): void {
    this._instructionDialog.hide();
  }

  public showStatusDialog(text: string): void {
    this._statusDialog.show(text);
  }

  public hideStatusDialog(): void {
    this._statusDialog.hide();
  }

}
