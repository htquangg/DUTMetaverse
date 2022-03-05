import Phaser from 'phaser';
import { SceneType } from '@tlq/types/Scene';

export default class Background extends Phaser.Scene {
  constructor() {
    super(SceneType.BACKGROUND);
  }

  create() {
    const sceneWidth = this.cameras.main.width;
    const sceneHeight = this.cameras.main.height;

    this.cameras.main.setBackgroundColor('#c6eefc');

    const backdropImage = this.add.image(
      sceneWidth / 2,
      sceneHeight / 2,
      'backdrop_day',
    );
    const scale = Math.max(
      sceneWidth / backdropImage.width,
      sceneHeight / backdropImage.height,
    );
    backdropImage.setScale(scale).setScrollFactor(0);
  }
}
