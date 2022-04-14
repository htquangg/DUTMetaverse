import * as Colyseus from 'colyseus.js';
import {
  RoomState,
  IDUTState,
  IPlayer,
  Messages,
  IComputer,
  IWhiteboard,
  ItemType,
  EventType,
  EventProps,
} from '@tlq/types';
import { EventManager } from '@tlq/events';
import { BuildConfig } from '@tlq/config';
import { WebRTCManager } from '@tlq/features/webRTC';
import { EventParamsMap } from '@tlq/types';
import { DataChange } from '@colyseus/schema';

export default class NetworkManager {
  private _client: Colyseus.Client;
  private _lobby!: Colyseus.Room;
  private _room?: Colyseus.Room<IDUTState>;
  private _webRTC!: WebRTCManager;

  public sessionID!: string;

  public static inst: NetworkManager;

  constructor() {
    const protocol = process.env.NODE_ENV === 'dev' ? 'ws' : 'wss';
    const serverDomain =
      process.env.GAME_SERVER_DOMAIN || BuildConfig.GameServerDomain;
    const serverPort =
      process.env.GAME_SERVER_PORT || BuildConfig.GameServerPort;

    const gameUrl = `${protocol}://${serverDomain}:${serverPort}`;

    this._client = new Colyseus.Client(gameUrl);
    this._webRTC = WebRTCManager.getInstance();

    this.joinLobbyRoom();
    console.error('[NetworkManager] Game Server URL: ', gameUrl);
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

    // handle room state change
    this._handleRoomStateChange();

    // handle messages from server
    this._handleOnMessagesFromServer();
  }

  private _handleRoomStateChange(): void {
    if (!this._room) return;

    this._room.state.players.onAdd = (player: IPlayer, key: string) => {
      if (key === this.sessionID) return;

      console.error('player: ', player, key);
      player.onChange = (
        changes: DataChange<EventParamsMap['PLAYER_UPDATED']['value']>[],
      ) => {
        changes.forEach((change) => {
          const { field, value } = change;

          EventManager.getInstance().emit('PLAYER_UPDATED', {
            playerID: key,
            field,
            value,
          });

          if (field === 'name' && value !== '') {
            console.log('[NetworkManager] player joined!!!', player, key);
            EventManager.getInstance().emit('PLAYER_JOINED', {
              player,
              playerID: key,
            });
          }
        });
      };
    };

    this._room.state.players.onRemove = (player: IPlayer, key: string) => {
      EventManager.getInstance().emit('PLAYER_LEFT', { playerID: key });
      this._webRTC.stopVideoStream(key);
      this._webRTC.stopOnCalledVideoStream(key);
    };

    this._room.state.computers.onAdd = (computer: IComputer, key: string) => {
      computer.connectedUser.onAdd = (clientID: string) => {
        EventManager.getInstance().emit('ITEM_ADD_USER', {
          playerID: clientID,
          itemID: key,
          itemType: ItemType.COMPUTER,
        });
      };

      computer.connectedUser.onRemove = (clientID: string) => {
        EventManager.getInstance().emit('ITEM_REMOVE_USER', {
          playerID: clientID,
          itemID: key,
          itemType: ItemType.COMPUTER,
        });
      };
    };

    this._room.state.whiteboards.onAdd = (
      whiteboard: IWhiteboard,
      key: string,
    ) => {
      whiteboard.connectedUser.onAdd = (clientID: string) => {
        EventManager.getInstance().emit('ITEM_ADD_USER', {
          playerID: clientID,
          itemID: key,
          itemType: ItemType.WHITEBOARD,
        });
      };

      whiteboard.connectedUser.onRemove = (clientID: string) => {
        EventManager.getInstance().emit('ITEM_REMOVE_USER', {
          playerID: clientID,
          itemID: key,
          itemType: ItemType.WHITEBOARD,
        });
      };
    };
  }

  private _handleOnMessagesFromServer(): void {
    if (!this._room) return;

    this._room.onMessage(Messages.SEND_ROOM_DATA, (content) => {
      console.error('send room data: ', content);
    });

    this._room.onMessage(Messages.NEW_COMMER, (content) => {
      console.error('new commer', content);
      this._webRTC.connectToNewUser(content.playerID);
    });
  }

  // <------------------------------------------------------->
  // <--------------- HANDLE EVENT LISTENER ----------------->
  // <------------------------------------------------------->
  public onPlayerJoined<T extends { player: IPlayer; playerID: string }>(
    callback: (msg: T) => void,
    context?: any,
  ) {
    EventManager.getInstance().on('PLAYER_JOINED', callback, context);
  }

  public onPlayerUpdated<
    T extends { playerID: string; field: string; value: number },
  >(callback: (msg: T) => void, context: any) {
    EventManager.getInstance().on('PLAYER_UPDATED', callback, context);
  }

  public onPlayerLeft<T extends { playerID: string }>(
    callback: (message: T) => void,
    context?: any,
  ) {
    EventManager.getInstance().on('PLAYER_LEFT', callback, context);
  }

  public onItemAddUser<
    T extends {
      playerID: string;
      itemID: string;
      itemType: ItemType;
    },
  >(callback: (msg: T) => void, context?: any) {
    console.error('onItemAddUser');
    EventManager.getInstance().on('ITEM_ADD_USER', callback, context);
  }

  public onItemRemoveUser<
    T extends {
      playerID: string;
      itemID: string;
      itemType: ItemType;
    },
  >(callback: (msg: T) => void, context?: any) {
    console.error('onItemRemoveUser');
    EventManager.getInstance().on('ITEM_REMOVE_USER', callback, context);
  }

  public onPlayerConnectComputer<T extends { computerID: string }>(
    callback: (msg: T) => void,
    context?: any,
  ) {
    console.error('onPlayerConnectComputer');
    EventManager.getInstance().on('CONNECT_TO_COMPUTER', callback, context);
  }

  public onPlayerConnectWhiteboard<T extends { whiteboardID: string }>(
    callback: (msg: T) => void,
    context?: any,
  ) {
    console.error('onPlayerConnectWhiteboard');
    EventManager.getInstance().on('CONNECT_TO_WHITEBOARD', callback, context);
  }

  // <------------------------------------------------------->
  // <--------------- HANDLE SEND MESSAGE TO SERVER --------->
  // <------------------------------------------------------->
  public sendMsgUpdatePlayer(
    currentX: number,
    currentY: number,
    currentAnim: string,
  ) {
    if (!this._room) return;
    this._room.send(Messages.UPDATE_PLAYER, {
      x: currentX,
      y: currentY,
      anim: currentAnim,
    });
  }

  public sendMsgReadyToConnect() {
    if (!this._room) return;
    this._room.send(Messages.READY_TO_CONNECT);
  }

  public sendMsgPlayerConnectComputer(computerID: string) {
    console.error('send sendMsgPlayerConnectComputer', computerID, this._room);
    if (!this._room) return;
    this._room.send(Messages.CONNECT_TO_COMPUTER, { computerID });
  }

  public sendMsgPlayerConnectWhiteboard(whiteboardID: string) {
    console.error(
      'send sendMsgPlayerConnectWhiteboard',
      whiteboardID,
      this._room,
    );
    if (!this._room) return;
    this._room.send(Messages.CONNECT_TO_WHITEBOARD, { whiteboardID });
  }

  public sendMsgPlayerDisconnectFromComputer(computerID: string) {
    console.error(
      ' send sendMsgPlayerDisconnectFromComputer',
      computerID,
      this._room,
    );
    if (!this._room) return;
    this._room.send(Messages.DISCONNECT_FROM_COMPUTER, { computerID });
  }

  public sendMsgPlayerDisconnectFromWhiteboard(whiteboardID: string) {
    console.error(
      ' send sendMsgPlayerDisconnectFromComputer',
      whiteboardID,
      this._room,
    );
    if (!this._room) return;
    this._room.send(Messages.DISCONNECT_FROM_WHITEBOARD, { whiteboardID });
  }
}
