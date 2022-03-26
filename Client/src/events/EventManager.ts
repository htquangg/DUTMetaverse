import Phaser from 'phaser';

export const EventManager = new Phaser.Events.EventEmitter();

export enum Event {
  PLAYER_JOINED = 'player_joined',
  PLAYER_UPDATED = 'player_updated',
  PLAYER_LEFT = 'player_left',
}
