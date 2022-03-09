import Phaser from 'phaser';
import Player from './Player';
import { PlayerState } from '@tlq/types';

export default class PlayerSelector extends Phaser.GameObjects.Zone {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width?: number,
    height?: number,
  ) {
    super(scene, x, y, width, height);
    scene.physics.add.existing(this);
  }

  update(player: Player, cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
    if (!cursors) return;

    if (player.behavior === PlayerState.SITTING) return;
  }
}
