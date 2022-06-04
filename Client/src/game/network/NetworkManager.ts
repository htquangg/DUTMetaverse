import * as Colyseus from 'colyseus.js';
import {
  RoomState,
  IDUTState,
  IPlayer,
  Messages,
  IComputer,
  IWhiteboard,
  ItemType,
  EventMessage,
  EventParamsMap,
} from '@tlq/game/types';
import { EventManager } from '@tlq/game/events';
import { BuildConfig } from '@tlq/game/config';
import { WebRTCManager } from '@tlq/game/features/webRTC';
import { DataChange } from '@colyseus/schema';
import ShareScreenManager from '@tlq/game/features/webRTC/ShareScreenManager';
import store from '@tlq/store';
import { setWhiteboardUrls } from '@tlq/store/whiteboard';
import { setVideoConnected } from '@tlq/store/user';

export default class NetworkManager {
  private _client: Colyseus.Client;
  private _lobby!: Colyseus.Room;
  private _room?: Colyseus.Room<IDUTState>;
  private _webRTCInstance!: WebRTCManager;
  private _shareScreenInstance!: ShareScreenManager;

  public sessionID!: string;

  public static inst: NetworkManager;

  constructor() {
    const protocol = process.env.NODE_ENV === 'development' ? 'ws' : 'wss';
    const serverDomain =
      process.env.GAME_SERVER_DOMAIN || BuildConfig.GameServerDomain;
    const serverPort =
      process.env.GAME_SERVER_PORT || BuildConfig.GameServerPort;

    const gameUrl = `${protocol}://${serverDomain}:${serverPort}`;

    this._client = new Colyseus.Client(gameUrl);
    this._webRTCInstance = WebRTCManager.getInstance();
    this._shareScreenInstance = ShareScreenManager.getInstance();

    this.joinLobbyRoom();
    console.error('[NetworkManager] Game Server URL: ', gameUrl);
  }

  static getInstance(): NetworkManager {
    if (!NetworkManager.inst) {
      NetworkManager.inst = new NetworkManager();
    }

    return NetworkManager.inst;
  }

  public async checkPreviousPermission(): Promise<void> {
    const result = await this._webRTCInstance.checkPreviousPermissions();
    if (result) {
      store.dispatch(setVideoConnected(true));
    }
  }

  public getUserMedia(): Promise<MediaStream> {
    return this._webRTCInstance.getUserMedia();
  }

  public async joinLobbyRoom() {
    this._lobby = await this._client.joinOrCreate(RoomState.LOBBY);

    this._lobby.onMessage('rooms', (rooms) => {
      console.error('[NetworkManager] rooms joinLobbyRoom: ', rooms);
    });

    this._lobby.onMessage('+', (rooms) => {
      console.error('[NetworkManager] + joinLobbyRoom: ', rooms);
    });

    this._lobby.onMessage('-', (rooms) => {
      console.error('[NetworkManager] - joinLobbyRoom: ', rooms);
    });
  }

  public async joinOrCreatePublic() {
    this._room = await this._client.joinOrCreate(RoomState.PUBLIC);
    this._initialize();
  }

  public disconnect() {
    this._webRTCInstance.disconnect();

    if (this._room) {
      console.error('[NetworkManager] room disconnect');
      this._room.leave();
    }
    if (this._lobby) {
      console.error('[NetworkManager] lobby disconnect');
      this._lobby.leave();
    }
  }

  public startShareScreen(itemID: string) {
    this._shareScreenInstance.startShareScreen().then((_stream) => {
      this.sendMsgPlayerStartShareScreen(itemID);
    });
  }

  public stopShareScreen(itemID: string) {
    this._shareScreenInstance.stopShareScreen().then(() => {
      this.sendMsgPlayerStopShareScreen(itemID);
    });
  }

  private _initialize() {
    if (!this._room) return;

    if (this._lobby) {
      this._lobby.leave();
    }

    this.sessionID = this._room.sessionId;

    this._webRTCInstance.initilize(this.sessionID);
    this._shareScreenInstance.initilize(this.sessionID);

    console.error('[NetworkManager] room: ', this._room);
    console.error('[NetworkManager] sessionID: ', this.sessionID);

    // handle room state change
    this._handleRoomStateChange();

    // handle messages from server
    this._handleOnMessagesFromServer();
  }

  private _handleRoomStateChange(): void {
    if (!this._room) return;

    this._room.state.players.onAdd = (player: IPlayer, key: string) => {
      if (key === this.sessionID) return;

      console.error('[NetworkManager] _handleRoomStateChange.', player, key);
      player.onChange = (
        changes: DataChange<
          EventParamsMap[EventMessage.PLAYER_UPDATED]['value']
        >[],
      ) => {
        changes.forEach((change) => {
          const { field, value } = change;

          EventManager.getInstance().emit(EventMessage.PLAYER_UPDATED, {
            playerID: key,
            field,
            value,
          });

          if (field === 'name' && value !== '') {
            console.log('[NetworkManager] player joined!!!', player, key);
            EventManager.getInstance().emit(EventMessage.PLAYER_JOINED, {
              player,
              playerID: key,
            });
          }
        });
      };
    };

    this._room.state.players.onRemove = (player: IPlayer, key: string) => {
      EventManager.getInstance().emit(EventMessage.PLAYER_LEFT, {
        playerID: key,
      });
      this._webRTCInstance.stopVideoStream(key);
      this._webRTCInstance.stopOnCalledVideoStream(key);
    };

    this._room.state.computers.onAdd = (computer: IComputer, key: string) => {
      computer.connectedUser.onAdd = (clientID: string) => {
        EventManager.getInstance().emit(EventMessage.ITEM_ADD_USER, {
          playerID: clientID,
          itemID: key,
          itemType: ItemType.COMPUTER,
        });
      };

      computer.connectedUser.onRemove = (clientID: string) => {
        EventManager.getInstance().emit(EventMessage.ITEM_REMOVE_USER, {
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
      store.dispatch(
        setWhiteboardUrls({
          whiteboardID: key,
          roomID: whiteboard.roomID,
        }),
      );
      whiteboard.connectedUser.onAdd = (clientID: string) => {
        EventManager.getInstance().emit(EventMessage.ITEM_ADD_USER, {
          playerID: clientID,
          itemID: key,
          itemType: ItemType.WHITEBOARD,
        });
      };

      whiteboard.connectedUser.onRemove = (clientID: string) => {
        EventManager.getInstance().emit(EventMessage.ITEM_REMOVE_USER, {
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
      console.error('[NetworkManager] send room data.', content);
    });

    this._room.onMessage(Messages.NEW_COMMER, (content) => {
      console.error('[NetworkManager] new commer.', content);
      this._webRTCInstance.connectToNewUser(content.playerID);
    });

    this._room.onMessage(Messages.START_SHARE_SCREEN, (clientIDs: string[]) => {
      this._shareScreenInstance.callRemoteUsers(clientIDs);
    });

    this._room.onMessage(Messages.STOP_SHARE_SCREEN, (clientID: string) => {
      this._shareScreenInstance.onUserLeft(clientID);
    });

    this._room.onMessage(
      Messages.CONNECT_TO_COMPUTER,
      (clientIDs: string[]) => {
        this._shareScreenInstance.callRemoteUsers(clientIDs);
      },
    );

    this._room.onMessage(
      Messages.DISCONNECT_FROM_COMPUTER,
      (clientID: string) => {
        this._shareScreenInstance.onUserLeft(clientID);
      },
    );
  }

  // <------------------------------------------------------->
  // <--------------- HANDLE EVENT LISTENER ----------------->
  // <------------------------------------------------------->
  public onPlayerJoined<T extends EventParamsMap[EventMessage.PLAYER_JOINED]>(
    callback: (msg: T) => void,
    context?: any,
  ) {
    EventManager.getInstance().on(
      EventMessage.PLAYER_JOINED,
      callback,
      context,
    );
  }

  public onPlayerUpdated<T extends EventParamsMap[EventMessage.PLAYER_UPDATED]>(
    callback: (msg: T) => void,
    context: any,
  ) {
    EventManager.getInstance().on(
      EventMessage.PLAYER_UPDATED,
      callback,
      context,
    );
  }

  public onPlayerLeft<T extends EventParamsMap[EventMessage.PLAYER_LEFT]>(
    callback: (message: T) => void,
    context?: any,
  ) {
    EventManager.getInstance().on(EventMessage.PLAYER_LEFT, callback, context);
  }

  public onItemAddUser<T extends EventParamsMap[EventMessage.ITEM_ADD_USER]>(
    callback: (msg: T) => void,
    context?: any,
  ) {
    console.error('[NetworkManager] onItemAddUser');
    EventManager.getInstance().on(
      EventMessage.ITEM_ADD_USER,
      callback,
      context,
    );
  }

  public onItemRemoveUser<
    T extends EventParamsMap[EventMessage.ITEM_REMOVE_USER],
  >(callback: (msg: T) => void, context?: any) {
    console.error('[NetworkManager] onItemRemoveUser.');
    EventManager.getInstance().on(
      EventMessage.ITEM_REMOVE_USER,
      callback,
      context,
    );
  }

  public onPlayerConnectComputer<
    T extends EventParamsMap[EventMessage.CONNECT_TO_COMPUTER],
  >(callback: (msg: T) => void, context?: any) {
    console.error('[NetworkManager] onPlayerConnectComputer.');
    EventManager.getInstance().on(
      EventMessage.CONNECT_TO_COMPUTER,
      callback,
      context,
    );
  }

  public onPlayerConnectWhiteboard<
    T extends EventParamsMap[EventMessage.CONNECT_TO_WHITEBOARD],
  >(callback: (msg: T) => void, context?: any) {
    console.error('[NetworkManager] onPlayerConnectWhiteboard.');
    EventManager.getInstance().on(
      EventMessage.CONNECT_TO_WHITEBOARD,
      callback,
      context,
    );
  }

  public onPlayerStopSharing<
    T extends EventParamsMap[EventMessage.STOP_SHARING],
  >(callback: (msg: T) => void, context?: any) {
    console.error('[NetworkManager] onPlayerConnectWhiteboard.');
    EventManager.getInstance().on(
      EventMessage.STOP_SHARING,
      callback,
      context,
    );
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

  public sendMsgPlayerChangeName(name: string) {
    if (!this._room) return;
    this._room.send(Messages.PLAYER_CHANGE_NAME, {
      name,
    });
  }

  public sendMsgReadyToConnect() {
    if (!this._room) return;
    this._room.send(Messages.READY_TO_CONNECT);
  }

  public sendMsgPlayerConnectComputer(computerID: string) {
    console.error(
      '[NetworkManager] sendMsgPlayerConnectComputer',
      computerID,
      this._room,
    );
    if (!this._room) return;
    this._room.send(Messages.CONNECT_TO_COMPUTER, { computerID });
  }

  public sendMsgPlayerConnectWhiteboard(whiteboardID: string) {
    console.error(
      '[NetworkManager] sendMsgPlayerConnectWhiteboard',
      whiteboardID,
      this._room,
    );
    if (!this._room) return;
    this._room.send(Messages.CONNECT_TO_WHITEBOARD, { whiteboardID });
  }

  public sendMsgPlayerDisconnectFromComputer(computerID: string) {
    console.error(
      '[NetworkManager] sendMsgPlayerDisconnectFromComputer',
      computerID,
      this._room,
    );
    if (!this._room) return;
    this._room.send(Messages.DISCONNECT_FROM_COMPUTER, { computerID });
  }

  public sendMsgPlayerDisconnectFromWhiteboard(whiteboardID: string) {
    console.error(
      '[NetworkManager] sendMsgPlayerDisconnectFromComputer',
      whiteboardID,
      this._room,
    );
    if (!this._room) return;
    this._room.send(Messages.DISCONNECT_FROM_WHITEBOARD, { whiteboardID });
  }

  public sendMsgPlayerStartShareScreen(id: string) {
    if (!this._room) return;
    this._room.send(Messages.START_SHARE_SCREEN, { computerID: id });
  }

  public sendMsgPlayerStopShareScreen(id: string) {
    if (!this._room) return;
    this._room.send(Messages.STOP_SHARE_SCREEN, { computerID: id });
  }
}
