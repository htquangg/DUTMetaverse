import {
  Schema,
  SetSchema,
  MapSchema,
  ArraySchema,
  type,
} from '@colyseus/schema';
import {
  IPlayer,
  IComputer,
  IWhiteboard,
  IChatMessage,
  IDUTState,
} from '../../types/IDUTState';

export class Player extends Schema implements IPlayer {
  @type('string') name = '';
  @type('number') x = 0;
  @type('number') y = 0;
  @type('string') anim = '';
}

export class Computer extends Schema implements IComputer {
  @type({ set: 'string' }) connectedUser = new SetSchema<string>();
}

export class Whiteboard extends Schema implements IWhiteboard {
  @type('string') roomID = getRoomId();
  @type({ set: 'string' }) connectedUser = new SetSchema<string>();
}

export class ChatMessage extends Schema implements IChatMessage {
  @type('string') author = '';
  @type('number') createdAt = new Date().getTime();
  @type('string') content = '';
}

export class DUTState extends Schema implements IDUTState {
  @type({ map: Player })
  players = new MapSchema<Player>();

  @type({ map: Computer })
  computers = new MapSchema<Computer>();

  @type({ map: Whiteboard })
  whiteboards = new MapSchema<Whiteboard>();

  @type([ChatMessage])
  chatMessages = new ArraySchema<ChatMessage>();
}

export const whiteboardRoomIds = new Set<string>();
const characters =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const charactersLength = characters.length;

function getRoomId() {
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  if (!whiteboardRoomIds.has(result)) {
    whiteboardRoomIds.add(result);
    return result;
  } else {
    console.log('roomId exists, remaking another one.');
    getRoomId();
  }
}
