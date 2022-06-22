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
  ComputerStart,
} from './commands/ComputerUpdateCommand';
import {
  WhiteboardAddUserCommand,
  WhiteboardRemoveUserCommand,
} from './commands/WhiteboardUpdateCommand';
import PlayerUpdateNameCommand from './commands/PlayerUpdateNameCommand';
import { ChatMessageUpdateCommand } from './commands/ChatMessageUpdateCommand';

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
    });
  }

  onDispose() {
    this.state.whiteboards.forEach((whiteboard) => {
      if (whiteboardRoomIds.has(whiteboard.roomID)) {
        whiteboardRoomIds.delete(whiteboard.roomID);
      }

      console.log('room', this.roomId, 'disposing...');
      this._dispatcher.stop();
    });
  }

  private _onMessageFromClient(): void {
    this.onMessage(Messages.UPDATE_PLAYER, this._handleUpdatePlayer.bind(this));

    this.onMessage(
      Messages.PLAYER_CHANGE_NAME,
      this._handlePlayerChangeName.bind(this),
    );

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
      Messages.START_SHARE_SCREEN,
      this._handleToStartShareScreen.bind(this),
    );

    this.onMessage(
      Messages.STOP_SHARE_SCREEN,
      this._handleToStopShareScreen.bind(this),
    );

    this.onMessage(
      Messages.CONNECT_TO_WHITEBOARD,
      this._handleToConnectWhiteboard.bind(this),
    );

    this.onMessage(
      Messages.DISCONNECT_FROM_WHITEBOARD,
      this._handleToDisconnectFromWhiteboard.bind(this),
    );

    this.onMessage(
      Messages.ADD_CHAT_MESSAGE,
      this._handleToReceiveChatMessage.bind(this),
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

  private _handlePlayerChangeName(client: Client, message: { name: string }) {
    this._dispatcher.dispatch(new PlayerUpdateNameCommand(), {
      client,
      name: message.name,
    });
  }

  private _handleToConnectComputer(
    client: Client,
    message: { computerID: string },
  ) {
    this._dispatcher.dispatch(new ComputerAddUserCommand(), {
      client,
      computerID: message.computerID,
    });
    const computer = this.state.computers.get(message.computerID);
    if (computer) {
      computer.connectedUser.forEach((id) => {
        this.clients.forEach((cli) => {
          if (cli.sessionId === id && cli.sessionId !== client.sessionId) {
            cli.send(Messages.CONNECT_TO_COMPUTER, [client.sessionId]);
          }
        });
      });
    }
  }

  private _handleToDisconnectFromComputer(
    client: Client,
    message: { computerID: string },
  ) {
    this._dispatcher.dispatch(new ComputerRemoveUserCommand(), {
      client,
      computerID: message.computerID,
    });
    const computer = this.state.computers.get(message.computerID);
    if (computer) {
      console.error('handle to DISCONNECT_FROM_COMPUTER: ', client.sessionId);
      console.error(
        'handle to DISCONNECT_FROM_COMPUTER: ',
        computer.userMaster,
      );
      if (client.sessionId === computer.userMaster) {
        client.send(Messages.STOP_SHARE_SCREEN, client.sessionId);
        computer.connectedUser.forEach((id) => {
          this.clients.forEach((cli) => {
            if (cli.sessionId === id && cli.sessionId !== client.sessionId) {
              cli.send(Messages.DISCONNECT_FROM_COMPUTER, client.sessionId);
            }
          });
        });
      } else {
        client.send(Messages.STOP_SHARE_SCREEN, client.sessionId);
      }
    }
  }

  private _handleToStartShareScreen(
    client: Client,
    message: { computerID: string },
  ) {
    this._dispatcher.dispatch(new ComputerStart(), {
      client,
      computerID: message.computerID,
    });
    const computer = this.state.computers.get(message.computerID);
    if (computer) {
      client.send(Messages.START_SHARE_SCREEN, computer.connectedUser);
    }
  }

  private _handleToStopShareScreen(
    client: Client,
    message: { computerID: string },
  ) {
    const computer = this.state.computers.get(message.computerID);
    if (computer) {
      computer.connectedUser.forEach((id) => {
        this.clients.forEach((cli) => {
          if (cli.sessionId === id) {
            cli.send(Messages.STOP_SHARE_SCREEN, client.sessionId);
          }
        });
      });
    }
  }

  private _handleToConnectWhiteboard(
    client: Client,
    message: { whiteboardID: string },
  ) {
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
  private _handleToReceiveChatMessage(
    client: Client,
    message: { content: string },
  ) {
    this._dispatcher.dispatch(new ChatMessageUpdateCommand(), {
      client,
      content: message.content,
    });

    this.broadcast(
      Messages.ADD_CHAT_MESSAGE,
      { playerID: client.sessionId, content: message.content },
      { except: client },
    );
  }
}
