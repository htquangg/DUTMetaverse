import ItemBase from './ItemBase';
import { EventMessage, ItemType } from '@tlq/game/types';
import { SetSchema } from '@colyseus/schema';
import { EventManager } from '@tlq/game/events';
import store from '@tlq/store';
import { openWhiteboardDialog } from '@tlq/store/whiteboard';

export default class Whiteboard extends ItemBase {
  public id!: string;
  public currentUsers: SetSchema<string>;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string | Phaser.Textures.Texture,
    frame?: string | number,
  ) {
    super(scene, x, y, texture, frame);
    this.currentUsers = new SetSchema<string>();
  }

  private _updateStatus() {
    if (!this.currentUsers) return;
    this.hideStatusDialog();
    const numberOfUsers = this.currentUsers.size;
    if (numberOfUsers === 0) {
      this.hideStatusDialog();
    } else if (numberOfUsers === 1) {
      this.showStatusDialog(`${numberOfUsers} user.`);
    } else {
      this.showStatusDialog(`${numberOfUsers} users.`);
    }
  }

  public getType(): ItemType {
    return ItemType.WHITEBOARD;
  }

  public onOverlapDialog() {
    if (this.currentUsers.size === 0) {
      this.showInstructionDialog('Press R to use whiteboard!!!');
    } else {
      this.showInstructionDialog('Press R join!!!');
    }
  }

  public openDialog(playerID: string) {
    if (!this.id) return;
    console.error('Whiteboard openDialog: ', playerID);
    store.dispatch(openWhiteboardDialog(this.id));
    EventManager.getInstance().emit(EventMessage.CONNECT_TO_WHITEBOARD, {
      whiteboardID: this.id,
    });
  }

  public addCurrentUser(playerID: string) {
    console.error('computer add currentUsers');
    if (!this.currentUsers || this.currentUsers.has(playerID)) return;
    this.currentUsers.add(playerID);
    this._updateStatus();
  }

  public removeCurrentUsers(playerID: string) {
    if (!this.currentUsers || !this.currentUsers.has(playerID)) return;
    this.currentUsers.delete(playerID);
    this._updateStatus();
  }
}
