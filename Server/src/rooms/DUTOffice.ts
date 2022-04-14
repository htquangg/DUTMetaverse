import { Room, Client } from 'colyseus';
import { Dispatcher } from '@colyseus/command';
import {
  Computer,
  DUTState,
  Player,
  Whiteboard,
  whiteboardRoomIds,
} from './schema/DUTState';
import { PlayerUpdateCommand } from './commands';
import { Messages } from '../types/Messages';
import { GameConfig } from '../config/GameConfig';
import {
  ComputerAddUserCommand,
  ComputerRemoveUserCommand,
} from './commands/ComputerUpdateCommand';
import {
  WhiteboardAddUserCommand,
  WhiteboardRemoveUserCommand,
} from './commands/WhiteboardUpdateCommand';

export class DUTOffice extends Room<DUTState> {
  private _dispatcher!: Dispatcher<this>;

  onCreate(options: any) {
    this._dispatcher = new Dispatcher(this);

    this.setState(new DUTState());

    for (let idx = 0; idx < GameConfig.MAX_COMPUTERS; idx++) {
      this.state.computers.set(String(idx), new Computer());
    }

    for (let idx = 0; idx < GameConfig.MAX_WHITEBOARDS; idx++) {
      this.state.whiteboards.set(String(idx), new Whiteboard());
    }

    // handle message from client
    this._onMessageFromClient();

    console.log('@@@ DUTOffice onCreate ');
  }

  onJoin(client: Client, options: any) {
    this.state.players.set(client.sessionId, new Player());

    client.send(Messages.SEND_ROOM_DATA, {
      id: this.roomId,
      message: 'hello new player',
    });

    this.broadcast(
      Messages.NEW_COMMER,
      { playerID: client.sessionId, message: 'new commer is comming ...' },
      { except: client },
    );
  }

  onLeave(client: Client, consented?: boolean) {
    const clientID = client.sessionId;

    if (this.state.players.has(clientID)) {
      this.state.players.delete(clientID);
    }

    this.state.computers.forEach((computer) => {
      if (computer.connectedUser.has(clientID)) {
        computer.connectedUser.delete(clientID);
      }
    });

    this.state.whiteboards.forEach((whiteboard) => {
      if (whiteboard.connectedUser.has(clientID)) {
        whiteboard.connectedUser.delete(clientID);
      }

      console.log('room', this.roomId, 'disposing...');
      this._dispatcher.stop();
    });
  }

  onDispose() {
    this.state.whiteboards.forEach((whiteboard) => {
      if (whiteboardRoomIds.has(whiteboard.roomID)) {
        whiteboardRoomIds.delete(whiteboard.roomID);
      }
    });
  }

  private _onMessageFromClient(): void {

    this.onMessage(Messages.UPDATE_PLAYER, this._handleUpdatePlayer.bind(this));

    this.onMessage(Messages.READY_TO_CONNECT, (client) => {
      const player = this.state.players.get(client.sessionId);
      if (player) player.readyToConnect = true;
    });

    this.onMessage(
      Messages.CONNECT_TO_COMPUTER,
      this._handleToConnectComputer.bind(this),
    );

    this.onMessage(
      Messages.DISCONNECT_FROM_COMPUTER,
      this._handleToDisconnectFromComputer.bind(this),
    );

    this.onMessage(
      Messages.CONNECT_TO_WHITEBOARD,
      this._handleToConnectWhiteboard.bind(this),
    );

    this.onMessage(
      Messages.DISCONNECT_FROM_WHITEBOARD,
      this._handleToDisconnectFromWhiteboard.bind(this),
    );
  }

  private _handleUpdatePlayer(
    client: Client,
    message: {
      x: number;
      y: number;
      anim: string;
    },
  ) {
    this._dispatcher.dispatch(new PlayerUpdateCommand(), {
      client: client,
      x: message.x,
      y: message.y,
      anim: message.anim,
    });
  }

  private _handleToConnectComputer(client: Client, message: { computerID: string }) {
    this._dispatcher.dispatch(new ComputerAddUserCommand(), {
      client,
      computerID: message.computerID,
    });
  }

  private _handleToDisconnectFromComputer(
    client: Client,
    message: { computerID: string },
  ) {
    this._dispatcher.dispatch(new ComputerRemoveUserCommand(), {
      client,
      computerID: message.computerID,
    });
  }

  private _handleToConnectWhiteboard(client: Client, message: { whiteboardID: string }) {
    this._dispatcher.dispatch(new WhiteboardAddUserCommand(), {
      client,
      whiteboardID: message.whiteboardID,
    });
  }

  private _handleToDisconnectFromWhiteboard(
    client: Client,
    message: { whiteboardID: string },
  ) {
    this._dispatcher.dispatch(new WhiteboardRemoveUserCommand(), {
      client,
      whiteboardID: message.whiteboardID,
    });
  }
}
