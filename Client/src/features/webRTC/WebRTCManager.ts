/// <reference types="webrtc" />
import Peer from 'peerjs';
import Utils from '@tlq/utils';
import { TlqLocalStorage } from '@tlq/localstorage';
import { StorageKeys } from '@tlq/types';
import { BuildConfig, GameConfig } from '@tlq/config';

export default class WebRTCManager {
  private _myVideo!: HTMLVideoElement;
  private _videoGrid: HTMLElement | null;
  private _buttonGrid: HTMLElement | null;

  private _myPeer!: Peer;
  private _myStream!: MediaStream;

  private _mediaStreamConstraints: MediaStreamConstraints | null;

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
    this._mediaStreamConstraints = {
      audio: true,
      video: true,
    };

    this._myVideo = document.createElement('video');

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

    this._myPeer = new Peer(sanitizedID, {
      host: process.env.PEER_SERVER_DOMAIN || BuildConfig.PeerServerDomain,
      port: Number(process.env.PEER_SERVER_PORT) || BuildConfig.PeerServerPort,
      path: process.env.PEER_SERVER_PATH || BuildConfig.PeerServerPath,
      secure: process.env.PEER_SERVER_DOMAIN === 'localhost' ? false : true,
    });

    this._myPeer.on('call', (call: Peer.MediaConnection) => {
      const video = document.createElement('video');

      console.error(this._myPeer);
      call.answer(this._myStream);
      call.on('stream', (remoteStream) => {
        this.startVideoStream(video, remoteStream);
      });
      this._onCalledPeers.set(call.peer, {
        call,
        video,
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
            this._mediaStreamConstraints = null;
            reject(
              `No webcam or microphone found, or permission is blocked!!!, ${_err}`,
            );
          });
      }
    });
  }

  // method to call a peer
  public makeCall(userID: string) {
    if (!this._myStream) return;

    const sanitizedID = Utils.replaceInvalidID(userID);
    if (!this._peers.has(sanitizedID)) {
      const call = this._myPeer.call(sanitizedID, this._myStream);
      const video = document.createElement('video');
      call.on('stream', (remoteStream) => {
        this.startVideoStream(video, remoteStream);
      });
      this._peers.set(sanitizedID, { call, video });
    }
  }

  public startVideoStream(video: HTMLVideoElement, stream: MediaStream) {
    if (!video || !stream) return;

    this.setUpButtons();

    video.srcObject = stream;

    video.onloadedmetadata = function (_ev: Event) {
      video.play();
    };

    if (this._videoGrid) this._videoGrid.append(video);
  }

  public stopVideoStream(userID: string) {
    const sanitizedID = Utils.replaceInvalidID(userID);
    if (this._peers.has(sanitizedID)) {
      const peer = this._peers.get(sanitizedID);
      if (peer) {
        peer.video.remove();
        peer.call.close();
        this._peers.delete(sanitizedID);
      }
    }
  }

  // set up mute/unmute and video on/off buttons
  setUpButtons() {
    if (
      !this._myStream ||
      !this._mediaStreamConstraints ||
      !this._videoGrid ||
      !this._buttonGrid
    )
      return;

    const audioButton = document.createElement('button');
    const videoButton = document.createElement('button');

    const audioTrack = this._myStream.getAudioTracks()[0];
    const videoTrack = this._myStream.getVideoTracks()[0];

    if (!audioTrack || !videoTrack) {
      this._videoGrid.style.display = 'none';
      this._buttonGrid.style.display = 'none';
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

    this._buttonGrid.append(audioButton);
    this._buttonGrid.append(videoButton);
  }
}
