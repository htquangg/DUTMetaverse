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
  private myPeer: Peer;
  myStream?: MediaStream;

  public static inst: ShareScreenManager;

  constructor(private userId: string) {
    const sanatizedId = this.makeId(userId);
    this.myPeer = new Peer(sanatizedId, {
      host: process.env.PEER_SERVER_DOMAIN || BuildConfig.PeerServerDomain,
      port: Number(process.env.PEER_SERVER_PORT) || BuildConfig.PeerServerPort,
      path: process.env.PEER_SERVER_PATH || BuildConfig.PeerServerPath,
      secure: process.env.PEER_SERVER_DOMAIN === 'localhost' ? false : true,
    });
    this.myPeer.on('error', (err) => {
      console.log('ShareScreenWebRTC err.type', err.type);
      console.error('ShareScreenWebRTC', err);
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
    this.stopScreenShare(false);
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
              this.stopScreenShare();
            };
          }
          resolve(stream);
        });
    });
  }

  startScreenShare() {
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
            this.stopScreenShare();
          };
        }

        this.myStream = stream;
        store.dispatch(setStream(stream));

        console.error('@@@start screen share');
        // Call all existing users.
        // const game = phaserGame.scene.keys.game as Game;
        const game = store.getState().game.gameScene as Game;
        const itemID = store.getState().computer.itemID;
        if (itemID) {
          const computerItem = game._computerMap.get(itemID);
          if (computerItem) {
            for (const userId of computerItem.currentUsers.values()) {
              this.onUserJoined(userId);
            }
          }
        }
      });
  }

  // TODO(daxchen): Fix this trash hack, if we call store.dispatch here when calling
  // from onClose, it causes redux reducer cycle, this may be fixable by using thunk
  // or something.
  stopScreenShare(shouldDispatch = true) {
    this.myStream?.getTracks().forEach((track) => track.stop());
    this.myStream = undefined;
    if (shouldDispatch) {
      store.dispatch(setStream(null));
      // Manually let all other existing users know screen sharing is stopped
      const game = store.getState().game.gameScene as Game;
      const itemID = store.getState().computer.itemID;
      if (itemID) {
        game.stopShareScreen(itemID);
      }
    }
  }

  onUserJoined(userId: string) {
    if (!this.myStream || userId === this.userId) return;
    console.error('onUserJoined:1111111111 ', userId);

    const sanatizedId = this.makeId(userId);
    this.myPeer.call(sanatizedId, this.myStream);
  }

  onUserLeft(userId: string) {
    console.error('ShareScreenManager: onUserLeft', userId, this.userId);
    this.myStream?.getTracks().forEach((track) => track.stop());
    this.myStream = undefined;
    if (userId === this.userId) return;

    const sanatizedId = this.makeId(userId);
    store.dispatch(removeVideoStream(sanatizedId));
  }
}
