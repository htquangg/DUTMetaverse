import Peer from 'peerjs';
import store from '@tlq/store';
import {
  setStream,
  addVideoStream,
  removeVideoStream,
} from '@tlq/store/computer';
import { BuildConfig } from '@tlq/game/config';
import { Game } from '@tlq/game/scenes';

export default class ShareScreenManager {
  private _playerID!: string;
  private myPeer!: Peer;
  myStream?: MediaStream;

  public static inst: ShareScreenManager;

  // constructor() {}

  public static getInstance(): ShareScreenManager {
    if (!ShareScreenManager.inst) {
      ShareScreenManager.inst = new ShareScreenManager();
    }
    return ShareScreenManager.inst;
  }

  public initilize(playerID: string) {
    this._playerID = playerID;

    const sanatizedId = this.makeId(playerID);
    this.myPeer = new Peer(sanatizedId, {
      host: process.env.PEER_SERVER_DOMAIN || BuildConfig.PeerServerDomain,
      port: Number(process.env.PEER_SERVER_PORT) || BuildConfig.PeerServerPort,
      path: process.env.PEER_SERVER_PATH || BuildConfig.PeerServerPath,
      secure: process.env.PEER_SERVER_DOMAIN === 'localhost' ? false : true,
    });
    this.myPeer.on('error', (err) => {
      console.error('[ShareScreenManager] error: ', err);
    });

    this.myPeer.on('call', (call) => {
      call.answer();
      call.on('stream', (userVideoStream) => {
        this.myStream = userVideoStream;
        store.dispatch(
          addVideoStream({ id: call.peer, call, stream: userVideoStream }),
        );
      });
      // we handled on close on our own
    });
  }

  onOpen() {
    if (this.myPeer.disconnected) {
      this.myPeer.reconnect();
    }
  }

  onClose() {
    this.stopShareScreen(false);
    this.myPeer.disconnect();
  }

  // PeerJS throws invalid_id error if it contains some characters such as that colyseus generates.
  // https://peerjs.com/docs.html#peer-id
  // Also for screen sharing ID add a `-ss` at the end.
  private makeId(id: string) {
    return `${id.replace(/[^0-9a-z]/gi, 'G')}-ss`;
  }

  private _getDisplayMedia(): Promise<MediaStream> {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices
        ?.getDisplayMedia({
          video: true,
          audio: true,
        })
        .then((stream) => {
          // Detect when user clicks "Stop sharing" outside of our UI.
          // https://stackoverflow.com/a/25179198
          const track = stream.getVideoTracks()[0];
          if (track) {
            track.onended = () => {
              this.stopShareScreen();
            };
          }
          resolve(stream);
        });
    });
  }

  startShareScreen(): Promise<MediaStream> {
    return new Promise((resolve, reject) => {
      this._getDisplayMedia().then((stream: MediaStream) => {
        console.error('[ShareScreenManager] start share screen.');
        this.myStream = stream;
        store.dispatch(setStream(stream));
        resolve(stream);
        // const game = store.getState().game.gameScene as Game;
        // const itemID = store.getState().computer.itemID;
        // if (itemID) {
        //   const computerItem = game._computerMap.get(itemID);
        //   if (computerItem) {
        //     for (const userId of computerItem.currentUsers.values()) {
        //       this.onUserJoined(userId);
        //     }
        //   }
        // }
      });
    });
  }

  stopShareScreen(shouldDispatch = true): Promise<void> {
    return new Promise((resolve, reject) => {
      console.error('[ShareScreenManager] stop share screen.');
      this.myStream?.getTracks().forEach((track) => track.stop());
      this.myStream = undefined;
      // if (shouldDispatch) {
      //   store.dispatch(setStream(null));
      //   // Manually let all other existing users know screen sharing is stopped
      //   const game = store.getState().game.gameScene as Game;
      //   const itemID = store.getState().computer.itemID;
      //   if (itemID) {
      //     game.stopShareScreen(itemID);
      //   }
      // }
      resolve();
    });
  }

  callRemoteUsers(clientIDs: string[]) {
    console.error(
      '[ShareScreenManager] call remote users: ',
      clientIDs,
      this._playerID,
    );
    for (const clientID of clientIDs) {
      this.onUserJoined(clientID);
    }
  }

  onUserJoined(userId: string) {
    console.error(
      '[ShareScreenManager] on user joined.',
      userId,
      this._playerID,
    );
    if (!this.myStream || userId === this._playerID) return;

    const sanatizedId = this.makeId(userId);
    this.myPeer.call(sanatizedId, this.myStream);
  }

  onUserLeft(userId: string) {
    console.error('[ShareScreenManager] on user left.', userId, this._playerID);
    this.myStream?.getTracks().forEach((track) => track.stop());
    this.myStream = undefined;
    // if (userId === this._playerID) return;

    const sanatizedId = this.makeId(userId);
    store.dispatch(removeVideoStream(sanatizedId));
  }
}
