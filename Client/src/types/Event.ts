import { IPlayer } from './IDUTState';
import { Schema } from '@colyseus/schema';
import { ItemType } from './Item';

export type EventType = keyof EventParamsMap;

export type EventProps<E extends EventType> = {
  params: EventParamsMap[E];
};

export type EventParamsMap = {
  PLAYER_JOINED: {
    player: IPlayer;
    playerID: string;
  };
  PLAYER_UPDATED: {
    playerID: string;
    field: string;
    value: Exclude<IPlayer[keyof IPlayer], Schema[keyof Schema]>;
  };
  PLAYER_LEFT: {
    playerID: string;
  };
  ITEM_ADD_USER: {
    playerID: string;
    itemID: string;
    itemType: ItemType;
  };
  ITEM_REMOVE_USER: {
    playerID: string;
    itemID: string;
    itemType: ItemType;
  };
  CONNECT_TO_COMPUTER: {
    computerID: string;
  };
  CONNECT_TO_WHITEBOARD: {
    whiteboardID: string;
  };
};
