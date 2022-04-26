import Phaser from 'phaser';

/**
 * shifting distance for sitting animation
 * format: direction: [xShift, yShift, depthShift]
 */
export const sittingShiftData = {
  up: [0, 3, -10],
  down: [0, 3, 1],
  left: [0, -8, 10],
  right: [0, -8, 10],
};

export default class Player extends Phaser.Physics.Arcade.Sprite {
  protected _playerID: string;
  protected _skin: string | Phaser.Textures.Texture;
  protected _playerName: Phaser.GameObjects.Text;
  public playerContainer: Phaser.GameObjects.Container;

  readonly SPEED = 500;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string | Phaser.Textures.Texture,
    id: string,
    frame?: string | number,
  ) {
    super(scene, x, y, texture, frame);

    this._playerID = id;
    this.setDepth(this.y);

    this._skin = texture;

    this.anims.play(`${this._skin}_idle_down`, false);

    this.playerContainer = this.scene.add
      .container(this.x, this.y - 30)
      .setDepth(5000);

  console.error("player constructor")
    // add playerName to playerContainer
    this._playerName = this.scene.add
      .text(0, 0, '')
      .setFontFamily('Arial')
      .setFontSize(12)
      .setColor('#000000')
      .setOrigin(0.5);
    this.playerContainer.add(this._playerName);

    this.scene.physics.world.enable(this.playerContainer);
    const playContainerBody = this.playerContainer
      .body as Phaser.Physics.Arcade.Body;
    const collisionScale = [0.5, 0.2];
    playContainerBody
      .setSize(this.width * collisionScale[0], this.height * collisionScale[1])
      .setOffset(-8, this.height * (1 - collisionScale[1]) + 6);
  }
}
