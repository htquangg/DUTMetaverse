import { Command } from '@colyseus/command';
import { Client } from 'colyseus';
import { DUTOffice } from '../DUTOffice';

type Payload = {
  client: Client;
  computerID: string;
};

export class ComputerAddUserCommand extends Command<DUTOffice, Payload> {
  execute(payload: Payload) {
    const { client, computerID } = payload;
    const clientID = client.sessionId;
    const computer = this.state.computers.get(computerID);

    if (!computer || computer.connectedUser.has(clientID)) return;
    computer.connectedUser.add(clientID);
  }
}

export class ComputerRemoveUserCommand extends Command<DUTOffice, Payload> {
  execute(payload: Payload) {
    const { client, computerID } = payload;
    const clientID = client.sessionId;
    const computer = this.state.computers.get(computerID);

    if (computer && computer.connectedUser.has(clientID)) {
      computer.connectedUser.delete(clientID);
    }
  }
}

export class ComputerStart extends Command<DUTOffice, Payload> {
  execute(payload: Payload) {
    const { client, computerID } = payload;
    const clientID = client.sessionId;
    const computer = this.state.computers.get(computerID);

    if (!computer || !computer.connectedUser.has(clientID)) return;
    computer.userMaster = clientID;
  }
}
