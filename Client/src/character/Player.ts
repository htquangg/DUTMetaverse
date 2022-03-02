import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string | Phaser.Textures.Texture,
    frame?: string | number,
  ) {
    super(scene, x, y, texture, frame);

    this.anims.play('nancy_idle_down', true);
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
    const speed = 500;

    if (cursors.up.isDown) {
      this.anims.play('nancy_run_up', true);
      this.setVelocity(0, -speed);
    } else if (cursors.down.isDown) {
      this.anims.play('nancy_run_down', true);
      this.setVelocity(0, speed);
    } else if (cursors.left.isDown) {
      this.anims.play('nancy_run_left', true);
      this.setVelocity(-speed, 0);
    } else if (cursors.right.isDown) {
      this.anims.play('nancy_run_right', true);
      this.setVelocity(speed, 0);
    } else {
      const parts = this.anims.currentAnim.key.split('_');
      parts[1] = 'idle';
      this.play(parts.join('_'));
      this.setVelocity(0, 0);
    }
  }
}

declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      player(
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame?: string | number,
      ): Player;
    }
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  'player',
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    x: number,
    y: number,
    texture: string | Phaser.Textures.Texture,
    frame?: string | number,
  ) {
    var sprite = new Player(this.scene, x, y, texture, frame);

    this.displayList.add(sprite);
    this.updateList.add(sprite);

    this.scene.physics.world.enableBody(
      sprite,
      Phaser.Physics.Arcade.DYNAMIC_BODY,
    );

    return sprite;
  },
);
