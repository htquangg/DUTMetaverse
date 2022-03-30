/// <reference types="webrtc" />
import Peer from 'peerjs';
import Utils from '@tlq/utils';
import { TlqLocalStorage } from '@tlq/localstorage';
import { StorageKeys } from '@tlq/types';

export default class WebRTCManager {
  private _videoElement!: HTMLVideoElement;
  private _videoGrid: HTMLElement | null;
  private _buttonGrid: HTMLElement | null;

  private _myPeer!: Peer;
  private _myStream!: MediaStream;

  private _peers: Map<
    string,
    { call: Peer.MediaConnection; video: HTMLVideoElement }
  >;
  private _onCalledPeers: Map<
    string,
    { call: Peer.MediaConnection; video: HTMLVideoElement }
  >;

  public static inst: WebRTCManager;

  constructor() {
    this._videoElement = document.createElement('video');

    this._buttonGrid = document.querySelector('.button-grid');
    this._videoGrid = document.querySelector('.video-grid');

    this._peers = new Map<
      string,
      { call: Peer.MediaConnection; video: HTMLVideoElement }
    >();
    this._onCalledPeers = new Map<
      string,
      { call: Peer.MediaConnection; video: HTMLVideoElement }
    >();
  }

  public static getInstance(): WebRTCManager {
    if (!WebRTCManager.inst) {
      WebRTCManager.inst = new WebRTCManager();
    }

    return WebRTCManager.inst;
  }

  public initilize(userID: string): void {
    const sanitizedID = Utils.replaceInvalidID(userID);

    this._myPeer = new Peer(sanitizedID);

    this._myPeer.on('call', (call: Peer.MediaConnection) => {
      call.answer(this._myStream);

      this._onCalledPeers.set(call.peer, {
        call,
        video: this._videoElement,
      });

      call.on('stream', (userStream) => {
        this._myStream = userStream;
        this.startVideoStream();
      });
    });

    this._myPeer.on('error', (err) => {
      console.error(`[WebRTCManager] Failed to initilize PeerJs: ${err}`);
    });
  }

  public checkPreviousPermissions(): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      const permission = 'microphone' as PermissionName;
      const permissionStatus = await navigator.permissions.query({
        name: permission,
      });

      if (permissionStatus.state !== 'granted') {
        return reject(
          new Error(
            'No webcam or microphone found, or permission is blocked!!!',
          ),
        );
      }

      return resolve(true);
    });
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

      navigator.mediaDevices
        .getUserMedia({
          audio: true,
          video: true,
        })
        .then((mediaStream) => {
          if (!mediaStream) {
            return reject(
              new Error(
                '[WebRTCManager] No webcam or microphone found, or permission is blocked!!!',
              ),
            );
          }
          this._myStream = mediaStream;
          this.startVideoStream();
          resolve(this._myStream);
        })
        .catch((_err) => {
          reject('No webcam or microphone found, or permission is blocked!!!');
        });
    });
  }

  // method to call a peer
  public makeCall(userID: string) {
    if (!this._myStream) return;

    const sanitizedID = Utils.replaceInvalidID(userID);
    if (!this._peers.has(sanitizedID)) {
      const call = this._myPeer.call(sanitizedID, this._myStream);

      call.on('stream', (userStream) => {
        this._myStream = userStream;
        this.startVideoStream();
      });

      this._peers.set(sanitizedID, { call, video: this._videoElement });
    }
  }

  public startVideoStream() {
    if (!this._videoElement || !this._myStream) return;

    this.setUpButtons();

    this._videoElement.srcObject = this._myStream;

    const t = this;
    this._videoElement.onloadedmetadata = function (_ev: Event) {
      t._videoElement.play();
    };

    if (this._videoGrid) this._videoGrid.append(this._videoElement);
  }

  public stopVideoStream() {

  }

  // set up mute/unmute and video on/off buttons
  setUpButtons() {
    if (!this._myStream) return;

    const audioButton = document.createElement('button');
    const videoButton = document.createElement('button');

    const audioTrack = this._myStream.getAudioTracks()[0];
    const videoTrack = this._myStream.getVideoTracks()[0];

    audioTrack.enabled =
      TlqLocalStorage.getItem(StorageKeys.AUDIO_TRACK) ?? true;
    videoTrack.enabled =
      TlqLocalStorage.getItem(StorageKeys.VIDEO_TRACK) ?? true;

    if (audioTrack.enabled) {
      audioButton.innerText = 'Mute';
    } else {
      audioButton.innerText = 'Unmute';
    }

    if (videoTrack.enabled) {
      videoButton.innerText = 'Video off';
    } else {
      videoButton.innerText = 'Video on';
    }

    audioButton.addEventListener('click', () => {
      if (audioTrack.enabled) {
        audioTrack.enabled = false;
        audioButton.innerText = 'Unmute';
        TlqLocalStorage.setItem(StorageKeys.AUDIO_TRACK, 'false');
      } else {
        audioTrack.enabled = true;
        audioButton.innerText = 'Mute';
        TlqLocalStorage.setItem(StorageKeys.AUDIO_TRACK, 'true');
      }
    });

    videoButton.addEventListener('click', () => {
      if (videoTrack.enabled) {
        videoTrack.enabled = false;
        videoButton.innerText = 'Video on';
        TlqLocalStorage.setItem(StorageKeys.VIDEO_TRACK, 'false');
      } else {
        videoTrack.enabled = true;
        videoButton.innerText = 'Video off';
        TlqLocalStorage.setItem(StorageKeys.VIDEO_TRACK, 'true');
      }
    });

    this._buttonGrid?.append(audioButton);
    this._buttonGrid?.append(videoButton);
  }
}
