import { Room, Client } from 'colyseus';
import { DUTState } from './schema/DUTState';

export class DUTOffice extends Room<DUTState> {
  onCreate(options: any) {
    this.setState(new DUTState());

    this.onMessage('new_user', (client, message) => {});
  }

  onJoin(client: Client, options: any) {}

  onLeave(client: Client, consented?: boolean) {}

  onDispose() {}
}
