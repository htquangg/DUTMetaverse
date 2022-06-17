import Phaser from 'phaser';
import { CustomCursorKeys } from '@tlq/game/types';

const KeyCodes = Phaser.Input.Keyboard.KeyCodes;

export const createCustomCursorKeys = (scene: Phaser.Scene): CustomCursorKeys => {
  return scene.input.keyboard.addKeys({
    up: KeyCodes.UP,
    down: KeyCodes.DOWN,
    left: KeyCodes.LEFT,
    right: KeyCodes.RIGHT,
    space: KeyCodes.SPACE,
    shift: KeyCodes.SHIFT,
    keyR: KeyCodes.R,
    keyE: KeyCodes.E,
    keyH: KeyCodes.H,
    keyJ: KeyCodes.J,
    keyK: KeyCodes.K,
    keyL: KeyCodes.L,
    keyM: KeyCodes.M,
  }) as CustomCursorKeys;
};
