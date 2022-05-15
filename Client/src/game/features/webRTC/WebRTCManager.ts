/// <reference types="webrtc" />
import Peer from 'peerjs';
import Utils from '@tlq/game/utils';
import { TlqLocalStorage } from '@tlq/localstorage';
import { StorageKeys } from '@tlq/game/types';
import { BuildConfig, GameConfig } from '@tlq/game/config';

// navigator.mediaDevices should have getDisplayMedia
// https://github.com/microsoft/TypeScript/issues/33232#issuecomment-633343054
declare global {
  interface MediaDevices {
    getDisplayMedia(constraints?: MediaStreamConstraints): Promise<MediaStream>;
  }

  // if constraints config still lose some prop, you can define it by yourself also
  interface MediaTrackConstraintSet {
    displaySurface?: ConstrainDOMString;
    logicalSurface?: ConstrainBoolean;
    // more....
  }
}

export default class WebRTCManager {
  private _myVideo!: HTMLVideoElement;
  private _videoGrid: HTMLElement | null;

  private _myPeer!: Peer;

  private _myStream!: MediaStream;
  private _myShareStream!: MediaStream;

  private _mediaStreamConstraints: MediaStreamConstraints;

  private _peers: Map<
    string,
    { call: Peer.MediaConnection; video: HTMLVideoElement; encryptID: string }
  >;
  private _onCalledPeers: Map<
    string,
    { call: Peer.MediaConnection; video: HTMLVideoElement; encryptID: string }
  >;

  private _peerRemoteId: string = '';

  public static inst: WebRTCManager;

  constructor() {
    this._mediaStreamConstraints = {
      audio: true,
      video: true,
    };

    this._myVideo = document.createElement('video');

    this._videoGrid = document.querySelector('.video-grid');

    // this._videoGrid!.style.gridTemplateColumns = `repeat(${GameConfig.VIDEO_PER_ROW}, minmax(10em, 1fr))`;

    this._peers = new Map<
      string,
      { call: Peer.MediaConnection; video: HTMLVideoElement; encryptID: string }
    >();
    this._onCalledPeers = new Map<
      string,
      { call: Peer.MediaConnection; video: HTMLVideoElement; encryptID: string }
    >();
  }

  public static getInstance(): WebRTCManager {
    if (!WebRTCManager.inst) {
      WebRTCManager.inst = new WebRTCManager();
    }

    return WebRTCManager.inst;
  }

  public initilize(playerID: string): void {
    const sanitizedID = Utils.replaceInvalidID(playerID);
    console.error('WebRTCManager initilize: ', process.env.PEER_SERVER_DOMAIN);

    this._myPeer = new Peer(sanitizedID, {
      host: process.env.PEER_SERVER_DOMAIN || BuildConfig.PeerServerDomain,
      port: Number(process.env.PEER_SERVER_PORT) || BuildConfig.PeerServerPort,
      path: process.env.PEER_SERVER_PATH || BuildConfig.PeerServerPath,
      secure: process.env.PEER_SERVER_DOMAIN === 'localhost' ? false : true,
    });

    this._myPeer.on('call', (call: Peer.MediaConnection) => {
      const video = document.createElement('video');

      call.answer(this._myStream);
      call.on('stream', (remoteStream) => {
        if (!this._onCalledPeers.has(call.peer)) {
          this._peerRemoteId = Utils.formatEncryptID(call.peer);
          this._onCalledPeers.set(call.peer, {
            call,
            video,
            encryptID: this._peerRemoteId,
          });
          this.startVideoStream(video, remoteStream);
        }
      });
    });

    this._myPeer.on('error', (err) => {
      console.error(`[WebRTCManager] Failed to initilize PeerJs: ${err}`);
    });
  }

  public disconnect() {
    this._peerRemoteId = '';
    this._peers.clear();
    this._myPeer.destroy();
  }

  public async checkPreviousPermissions(): Promise<boolean> {
    try {
      const permission = 'microphone' as PermissionName;
      const permissionStatus = await navigator.permissions.query({
        name: permission,
      });

      if (permissionStatus.state === 'granted') {
        this.getUserMedia();
        return Promise.resolve(true);
      }
      return false;
    } catch (error) {
      this.getUserMedia();
      console.error('Browser is not support permission: ', error);
      return Promise.resolve(true);
    }
  }

  public getUserMedia(): Promise<MediaStream> {
    return new Promise((resolve, reject) => {
      // Older browsers might not implement mediaDevices at all, so we set an empty object first
      let navigatorCopy = navigator as any;

      if (navigator.mediaDevices === undefined) {
        navigatorCopy.mediaDevices = {};
      }

      if (navigator.mediaDevices.getUserMedia === undefined) {
        navigatorCopy.mediaDevices.getUserMedia = function (
          constraints: MediaStreamConstraints,
        ) {
          const getUserMedia =
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia;

          // Some browsers just don't implement it - return a rejected promise with an error
          // to keep a consistent interface
          if (!getUserMedia) {
            return Promise.reject(
              new Error(
                '[WebRTCManager] getUserMedia is not implemented in this browser!!!',
              ),
            );
          }

          // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
          return new Promise(function (resolve, reject) {
            getUserMedia.call(navigator, constraints, resolve, reject);
          });
        };
      }

      if (this._mediaStreamConstraints) {
        navigator.mediaDevices
          .getUserMedia(this._mediaStreamConstraints)
          .then((mediaStream) => {
            if (!mediaStream) {
              return reject(
                new Error(
                  '[WebRTCManager] No webcam or microphone found, or permission is blocked!!!',
                ),
              );
            }
            this._myStream = mediaStream;
            this.startVideoStream(this._myVideo, this._myStream);
            resolve(this._myStream);
          })
          .catch((_err) => {
            reject(
              `No webcam or microphone found, or permission is blocked!!!, ${_err}`,
            );
          });
      }
    });
  }

  // method to call a peer
  public connectToNewUser(playerID: string): void {
    if (!this._myStream) return;

    const sanitizedID = Utils.replaceInvalidID(playerID);
    if (!this._peers.has(sanitizedID)) {
      const call = this._myPeer.call(sanitizedID, this._myStream);
      const video = document.createElement('video');
      call.on('stream', (remoteStream) => {
        if (!this._peers.has(sanitizedID)) {
          this._peerRemoteId = Utils.formatEncryptID(sanitizedID);
          this._peers.set(sanitizedID, {
            call,
            video,
            encryptID: this._peerRemoteId,
          });
          this.startVideoStream(video, remoteStream);
        }
      });
    }
  }

  public startVideoStream(video: HTMLVideoElement, stream: MediaStream): void {
    if (!video || !stream) return;

    video.srcObject = stream;
    video.onloadedmetadata = function (_ev: Event) {
      video.play();
    };
    this._setUpButtons(video);
  }

  // method delete video stream (when we are the host of the call)
  public stopVideoStream(playerID: string) {
    const sanitizedID = Utils.replaceInvalidID(playerID);
    if (this._peers.has(sanitizedID)) {
      const peer = this._peers.get(sanitizedID);
      if (peer) {
        const { encryptID, video, call } = peer;
        const remoteStreamEle = document.getElementsByClassName(encryptID)[0];

        if (remoteStreamEle) {
          remoteStreamEle.remove();
        }

        video.remove();
        call.close();
        this._peers.delete(sanitizedID);
      }
    }
  }

  // method to remove video stream (when we are the guest of the call)
  public stopOnCalledVideoStream(playerID: string) {
    const sanitizedID = Utils.replaceInvalidID(playerID);
    if (this._onCalledPeers.has(sanitizedID)) {
      const onCalledPeer = this._onCalledPeers.get(sanitizedID);
      if (onCalledPeer) {
        const { encryptID, video, call } = onCalledPeer;
        const remoteStreamEle = document.getElementsByClassName(encryptID)[0];

        if (remoteStreamEle) {
          remoteStreamEle.remove();
        }

        video.remove();
        call.close();
        this._onCalledPeers.delete(sanitizedID);
      }
    }
  }

  // method to start sharing current screen of user
  public startShareScreen(): void {
    navigator.mediaDevices
      .getDisplayMedia(this._mediaStreamConstraints)
      .then((mediaStream) => {
        // Detect when user clicks "Stop sharing" outside of our UI.
        // https://stackoverflow.com/a/25179198
        const track = mediaStream.getVideoTracks()[0];
        if (track) {
          track.onended = () => {
            this.stopShareScreen();
          };
        }

        this._myShareStream = mediaStream;

        // if (computerItem) {
        //   for (const userId of computerItem.currentUsers) {
        //     this.onUserJoined(userId);
        //   }
        // }
      });
  }

  // method to stop sharing currennt screen of user
  public stopShareScreen() {
    this._myShareStream?.getTracks().forEach((track) => track.stop());
  }

  // set up mute/unmute and video on/off buttons
  private _setUpButtons(video: HTMLVideoElement): void {
    if (!this._myStream || !this._mediaStreamConstraints || !this._videoGrid)
      return;

    this._peerRemoteId = this._peerRemoteId || 'me';

    const gridChild = document.createElement('div');
    gridChild.classList.add('grid-child', this._peerRemoteId);

    if (video !== this._myVideo) {
      const dotActive = document.createElement('div');
      dotActive.classList.add('dot', 'dot--green');

      gridChild.append(dotActive);
    } else {
      const buttonGrid = document.createElement('div');
      buttonGrid.classList.add('button-grid');

      const audioButton = document.createElement('button');
      const videoButton = document.createElement('button');

      const audioTrack = this._myStream.getAudioTracks()[0];
      const videoTrack = this._myStream.getVideoTracks()[0];

      if (!audioTrack || !videoTrack) {
        this._videoGrid.style.display = 'none';
        buttonGrid.style.display = 'none';
        return;
      }

      audioTrack.enabled =
        TlqLocalStorage.getItem(StorageKeys.AUDIO_TRACK) ??
        GameConfig.AUDIO_TRACK_DEFAULT;
      videoTrack.enabled =
        TlqLocalStorage.getItem(StorageKeys.VIDEO_TRACK) ??
        GameConfig.VIDEO_TRACK_DEFAULT;

      if (audioTrack.enabled) {
        audioButton.innerText = 'Mute';
        TlqLocalStorage.setItem(StorageKeys.AUDIO_TRACK, true);
      } else {
        audioButton.innerText = 'Unmute';
        TlqLocalStorage.setItem(StorageKeys.AUDIO_TRACK, false);
      }

      if (videoTrack.enabled) {
        videoButton.innerText = 'Video off';
        TlqLocalStorage.setItem(StorageKeys.VIDEO_TRACK, true);
      } else {
        videoButton.innerText = 'Video on';
        TlqLocalStorage.setItem(StorageKeys.VIDEO_TRACK, false);
      }

      audioButton.addEventListener('click', () => {
        if (audioTrack.enabled) {
          audioTrack.enabled = false;
          audioButton.innerText = 'Unmute';
          TlqLocalStorage.setItem(StorageKeys.AUDIO_TRACK, false);
        } else {
          audioTrack.enabled = true;
          audioButton.innerText = 'Mute';
          TlqLocalStorage.setItem(StorageKeys.AUDIO_TRACK, true);
        }
      });

      videoButton.addEventListener('click', () => {
        if (videoTrack.enabled) {
          videoTrack.enabled = false;
          videoButton.innerText = 'Video on';
          TlqLocalStorage.setItem(StorageKeys.VIDEO_TRACK, false);
        } else {
          videoTrack.enabled = true;
          videoButton.innerText = 'Video off';
          TlqLocalStorage.setItem(StorageKeys.VIDEO_TRACK, true);
        }
      });

      buttonGrid.append(audioButton);
      buttonGrid.append(videoButton);

      gridChild.append(buttonGrid);
    }

    gridChild.append(video);

    this._videoGrid.append(gridChild);
  }
}
