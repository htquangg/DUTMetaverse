import * as Colyseus from 'colyseus.js';
import { RoomState, IDUTState } from '@tlq/types';

export default class NetworkClient {
  private _client: Colyseus.Client;
  private _lobby!: Colyseus.Room;
  private _room?: Colyseus.Room<IDUTState>;

  constructor() {
    const protocol = window.location.protocol.replace('http', 'ws');
    const endpoint = `${protocol}://${window.location.hostname}:3000`;
    this._client = new Colyseus.Client(endpoint);
  }

  async joinLobbyRoom() {
    this._lobby = await this._client.joinOrCreate(RoomState.LOBBY);
  }

  async joinOrCreatePublic() {
    this._room = await this._client.joinOrCreate(RoomState.PUBLIC);
    this.initialize();
  }

  initialize() {
    if(!this._room) return;
    
  }
}
