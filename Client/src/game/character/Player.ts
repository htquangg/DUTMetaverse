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
  private _playerDialogBubble: Phaser.GameObjects.Container;
  public playerContainer: Phaser.GameObjects.Container;
  private _timeoutID?: number

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
      .container(this.x - 16, this.y - 24)
      .setDepth(5000);
    // add dialogBubble to playerContainer
    this._playerDialogBubble = this.scene.add.container(0, 0).setDepth(5000);

    // add playerName to playerContainer
    this._playerName = this.scene.add
      .text(0, 0, '')
      .setFontFamily('Arial')
      .setFontSize(12)
      .setColor('#000000')
      .setPosition(16, -24)
      .setOrigin(0.5);
    this.playerContainer.add(this._playerName);

    this.scene.physics.world.enable(this.playerContainer);
    const playContainerBody = this.playerContainer
      .body as Phaser.Physics.Arcade.Body;
    // const collisionScale = [0.5, 0.2];
    playContainerBody.setSize(this.width, this.height);
    // .setOffset(-8, this.height * (1 - collisionScale[1]) + 6);
  }

  updateDialogBubble(content: string) {
    this.clearDialogBubble();

    // preprocessing for dialog bubble text (maximum 70 characters)
    const dialogBubbleText =
      content.length <= 70 ? content : content.substring(0, 70).concat('...');

    const innerText = this.scene.add
      .text(0, 0, dialogBubbleText, {
        wordWrap: { width: 165, useAdvancedWrap: true },
      })
      .setFontFamily('Arial')
      .setFontSize(12)
      .setColor('#000000')
      .setOrigin(0.5);

    // set dialogBox slightly larger than the text in it
    const innerTextHeight = innerText.height;
    const innerTextWidth = innerText.width;

    innerText.setY(-innerTextHeight / 2 - this._playerName.height / 2);
    const dialogBoxWidth = innerTextWidth + 10;
    const dialogBoxHeight = innerTextHeight + 3;
    const dialogBoxX = innerText.x - innerTextWidth / 2 - 5;
    const dialogBoxY = innerText.y - innerTextHeight / 2 - 2;

    this._playerDialogBubble.add(
      this.scene.add
        .graphics()
        .fillStyle(0xffffff, 1)
        .fillRoundedRect(
          dialogBoxX,
          dialogBoxY,
          dialogBoxWidth,
          dialogBoxHeight,
          3,
        )
        .lineStyle(1, 0x000000, 1)
        .strokeRoundedRect(
          dialogBoxX,
          dialogBoxY,
          dialogBoxWidth,
          dialogBoxHeight,
          3,
        ),
    );
    this._playerDialogBubble.add(innerText);

    // After 6 seconds, clear the dialog bubble
    this._timeoutID = window.setTimeout(() => {
      this.clearDialogBubble();
    }, 6000);
  }

  private clearDialogBubble() {
    clearTimeout(this._timeoutID);
    this._playerDialogBubble.removeAll(true);
  }
}
