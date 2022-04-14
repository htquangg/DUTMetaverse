import { Command } from '@colyseus/command';
import { Client } from 'colyseus';
import { DUTOffice } from '../DUTOffice';

type Payload = {
  client: Client;
  whiteboardID: string;
};

export class WhiteboardAddUserCommand extends Command<DUTOffice, Payload> {
  execute(payload: Payload) {
    const { client, whiteboardID } = payload;
    const clientID = client.sessionId;
    const whiteboard = this.state.whiteboards.get(whiteboardID);

    if (!whiteboard || whiteboard.connectedUser.has(clientID)) return;
    whiteboard.connectedUser.add(clientID);
  }
}

export class WhiteboardRemoveUserCommand extends Command<DUTOffice, Payload> {
  execute(payload: Payload) {
    const { client, whiteboardID } = payload;
    const clientID = client.sessionId;
    const whiteboard = this.state.whiteboards.get(whiteboardID);

    if (whiteboard && whiteboard.connectedUser.has(clientID)) {
      whiteboard.connectedUser.delete(clientID);
    }
  }
}
