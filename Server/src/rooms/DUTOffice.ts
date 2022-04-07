import { Room, Client } from 'colyseus';
import { Dispatcher } from '@colyseus/command';
import { DUTState, Player } from './schema/DUTState';
import { PlayerUpdateCommand } from './commands';
import { Messages } from '../types/Messages';

export class DUTOffice extends Room<DUTState> {
  private _dispatcher!: Dispatcher<this>;

  onCreate(options: any) {
    this._dispatcher = new Dispatcher(this);
    this.setState(new DUTState());

    this.onMessage(
      Messages.UPDATE_PLAYER,
      (client: Client, message: { x: number; y: number; anim: string }) => {
        this._dispatcher.dispatch(new PlayerUpdateCommand(), {
          client: client,
          x: message.x,
          y: message.y,
          anim: message.anim,
        });
      },
    );

    this.onMessage(Messages.READY_TO_CONNECT, (client) => {
      const player = this.state.players.get(client.sessionId);
      if (player) player.readyToConnect = true;
    });

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
      { playerId: client.sessionId, message: 'new commer is comming ...' },
      { except: client },
    );
  }

  onLeave(client: Client, consented?: boolean) {
    if (this.state.players.has(client.sessionId)) {
      this.state.players.delete(client.sessionId);
      this.broadcast(Messages.USER_LEAVE, {
        playerId: client.sessionId, messsage: 'user leave'
      })
    }
  }

  onDispose() {}
}
