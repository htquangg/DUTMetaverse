/// <reference types="webrtc" />

export default class WebRTCManager {
  private _videoElement!: HTMLVideoElement;
  private _audioElement!: HTMLAudioElement;

  constructor() {}

  public initilize(): void {
    this._videoElement = document.createElement('video');
  }

  public async checkPreviousPermissions() {
    const permission = 'microphone' as PermissionName;
    const permissionStatus = await navigator.permissions.query({
      name: permission,
    });

    if (permissionStatus.state === 'granted') this.getUserMedia();
  }

  public async getUserMedia() {
    try {
      // Older browsers might not implement mediaDevices at all, so we set an empty object first
      let navigatorCopy = navigator as any;

      if (navigator.mediaDevices === undefined) {
        navigatorCopy.mediaDevices = {};
      }

      if (navigator.mediaDevices.getUserMedia === undefined) {
        navigatorCopy.mediaDevices.getUserMedia = function (constraint) {
          const getUserMedia =
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia;

          // Some browsers just don't implement it - return a rejected promise with an error
          // to keep a consistent interface
          if (!getUserMedia) {
            return Promise.reject(
              new Error('getUserMedia is not implemented in this browser'),
            );
          }

          // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
          return new Promise(function (resolve, reject) {
            getUserMedia.call(navigator, constraint, resolve, reject);
          });
        };
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      this.startVideoStream(stream);
    } catch (error) {}
  }

  public makeCall() {}

  public startVideoStream(mediaStream: MediaStream) {
    if (!this._videoElement) return;

    this._videoElement.srcObject = mediaStream;

    const t = this;
    this._videoElement.onloadedmetadata = function (_ev: Event) {
      t._videoElement.play();
    };
  }

  public stopVideoStream() {}
}
