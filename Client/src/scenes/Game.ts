import Phaser from 'phaser';
import { createCharacterAnim } from '../anim/CharacterAnims';

export default class Game extends Phaser.Scene {
  private map!: Phaser.Tilemaps.Tilemap;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private nancy!: Phaser.Physics.Arcade.Sprite;

  constructor() {
    super('game');
  }

  preload() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  create() {
    createCharacterAnim(this.anims);

    this.map = this.make.tilemap({ key: 'tilemap' });
    const FloorAndGround = this.map.addTilesetImage(
      'FloorAndGround',
      'tiles_wall',
    );

    const groundLayer = this.map.createLayer('Ground', FloorAndGround);
    groundLayer.setCollisionByProperty({ collides: true });

    this.nancy = this.physics.add.sprite(100, 100, 'nancy');
    // this.anims.play('nancy_idle_down', true);
    this.nancy.anims.play('nancy_idle_down', true);

    this.cameras.main.startFollow(this.nancy);
  }

  update(t: number, dt: number) {
    const speed = 250;

    if (!this.cursors) {
      return;
    }

    if (this.cursors.up.isDown) {
      this.nancy.anims.play('nancy_run_up', true);
      this.nancy.setVelocity(0, -speed);
    } else if (this.cursors.down.isDown) {
      this.nancy.anims.play('nancy_run_down', true);
      this.nancy.setVelocity(0, speed);
    } else if (this.cursors.left.isDown) {
      this.nancy.anims.play('nancy_run_left', true);
      this.nancy.setVelocity(-speed, 0);
    } else if (this.cursors.right.isDown) {
      this.nancy.anims.play('nancy_run_right', true);
      this.nancy.setVelocity(speed, 0);
    } else {
      const parts = this.nancy.anims.currentAnim.key.split('_');
      parts[1] = 'idle';
      this.nancy.play(parts.join('_'));
      this.nancy.setVelocity(0, 0);
    }
  }
}
