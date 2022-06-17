import { IPlayer } from './IDUTState';
import { Schema } from '@colyseus/schema';
import { ItemType } from './Item';

export enum EventMessage {
  PLAYER_JOINED = 'player-joined',
  PLAYER_UPDATED = 'player-updated',
  PLAYER_CHANGE_NAME = 'player-change-name',
  PLAYER_LEFT = 'player-left',
  ITEM_ADD_USER = 'item-add-user',
  ITEM_REMOVE_USER = 'item-remove-user',
  CONNECT_TO_COMPUTER = 'connect-to-computer',
  CONNECT_TO_WHITEBOARD = 'connect-to-whiteboard',
  STOP_SHARING = 'stop-sharing',
  UPDATE_DIALOG_BUBBLE = 'update-dialog-bubble',
}

export type KeyEventMessage = keyof typeof EventMessage;

export type EventName = typeof EventMessage[KeyEventMessage];

export type EventParamsMap = {
  [EventMessage.PLAYER_JOINED]: {
    player: IPlayer;
    playerID: string;
  };
  [EventMessage.PLAYER_UPDATED]: {
    playerID: string;
    field: string;
    value: Exclude<IPlayer[keyof IPlayer], Schema[keyof Schema]>;
  };
  [EventMessage.PLAYER_LEFT]: {
    playerID: string;
  };
  [EventMessage.ITEM_ADD_USER]: {
    playerID: string;
    itemID: string;
    itemType: ItemType;
  };
  [EventMessage.ITEM_REMOVE_USER]: {
    playerID: string;
    itemID: string;
    itemType: ItemType;
  };
  [EventMessage.CONNECT_TO_COMPUTER]: {
    computerID: string;
  };
  [EventMessage.CONNECT_TO_WHITEBOARD]: {
    whiteboardID: string;
  };
  [EventMessage.STOP_SHARING]: {
    itemID: string;
  };
  [EventMessage.UPDATE_DIALOG_BUBBLE]: {
    playerID: string;
    content: string;
  };
};
