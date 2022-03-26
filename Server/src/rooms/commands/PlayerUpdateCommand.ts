import { Command } from '@colyseus/command';
import { Client } from 'colyseus';
// import { IDUTState } from '../../types';
import { DUTOffice } from '../DUTOffice';

type Payload = {
  client: Client;
  x: number;
  y: number;
  anim: string;
};

export default class PlayerUpdateCommand extends Command<DUTOffice, Payload> {
  execute(payload: Payload) {
    const { client, x, y, anim } = payload;

    const player = this.room.state.players.get(client.sessionId);

    if (!player) return;
    player.x = x;
    player.y = y;
    player.anim = anim;
  }
}
