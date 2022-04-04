import * as Colyseus from 'colyseus.js';
import { RoomState, IDUTState, IPlayer, Messages } from '@tlq/types';
import { EventManager, Event } from '@tlq/events';
import { BuildConfig } from '@tlq/config';
import { WebRTCManager } from '@tlq/features/webRTC';

export default class NetworkManager {
  private _client: Colyseus.Client;
  private _lobby!: Colyseus.Room;
  private _room?: Colyseus.Room<IDUTState>;
  private _webRTC!: WebRTCManager;

  public sessionID!: string;

  public static inst: NetworkManager;

  constructor() {
    const endpoint =
      BuildConfig.Environment === 'DEV'
        ? 'ws://localhost:3000'
        : BuildConfig.GameServer;

    this._client = new Colyseus.Client(endpoint);
    this._webRTC = WebRTCManager.getInstance();

    this.joinLobbyRoom();
  }

  static getInstance(): NetworkManager {
    if (!NetworkManager.inst) {
      NetworkManager.inst = new NetworkManager();
    }

    return NetworkManager.inst;
  }

  public getUserMedia(): Promise<MediaStream> {
    return this._webRTC.getUserMedia();
  }

  public async joinLobbyRoom() {
    this._lobby = await this._client.joinOrCreate(RoomState.LOBBY);

    this._lobby.onMessage('rooms', (rooms) => {
      console.log('[NetworkClient] rooms joinLobbyRoom: ', rooms);
    });

    this._lobby.onMessage('+', (rooms) => {
      console.log('[NetworkClient] + joinLobbyRoom: ', rooms);
    });

    this._lobby.onMessage('-', (rooms) => {
      console.log('[NetworkClient] - joinLobbyRoom: ', rooms);
    });
  }

  public async joinOrCreatePublic() {
    this._room = await this._client.joinOrCreate(RoomState.PUBLIC);
    this._initialize();
  }

  private _initialize() {
    if (!this._room) return;

    this._lobby.leave();
    this.sessionID = this._room.sessionId;

    this._webRTC.initilize(this.sessionID);

    console.error(this._room);
    console.error(this.sessionID);

    this._room.state.players.onAdd = (player: IPlayer, key: string) => {
      if (key === this.sessionID) return;

      console.error('player: ', player, key);
      player.onChange = (changes) => {
        changes.forEach((change) => {
          const { field, value } = change;

          EventManager.emit(Event.PLAYER_UPDATED, field, value, key);

          if (field === 'name' && value !== '') {
            console.log('[NetworkManager] player joined!!!', player, key);
            EventManager.emit(Event.PLAYER_JOINED, player, key);
          }
        });
      };
    };

    this._room.state.players.onRemove = (player: IPlayer, key: string) => {
      EventManager.emit(Event.PLAYER_LEFT, key);
    };

    this._room.onMessage(Messages.READY_TO_CONNECT, (message) => {
      console.error('READY_TO_CONNECT: ', message);
    });
  }

  public onPlayerJoined(
    callback: (player: IPlayer, key: string) => void,
    context?: any,
  ) {
    EventManager.on(Event.PLAYER_JOINED, callback, context);
  }

  public onPlayerUpdated(
    callback: (field: string, value: number | string, key: string) => void,
    context: any,
  ) {
    EventManager.on(Event.PLAYER_UPDATED, callback, context);
  }

  public onPlayerLeft(callback: (key: string) => void, context?: any) {
    EventManager.on(Event.PLAYER_LEFT, callback, context);
  }

  public updatePlayer(currentX: number, currentY: number, currentAnim: string) {
    this._room?.send(Messages.UPDATE_PLAYER, {
      x: currentX,
      y: currentY,
      anim: currentAnim,
    });
  }
}
