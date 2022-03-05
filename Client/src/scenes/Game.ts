import Phaser from 'phaser';
import { createCharacterAnim } from '@tlq/anims/CharacterAnims';
import { debugDraw } from '@tlq/utils/debug';

import '@tlq/character/Player';
import Player from '@tlq/character/Player';

import {SceneType} from "@tlq/types/Scene";

export default class Game extends Phaser.Scene {
  private map!: Phaser.Tilemaps.Tilemap;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private player!: Player;

  constructor() {
    super(SceneType.GAME);
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

    debugDraw(groundLayer, this);

    this.player = this.add.player(100, 100, 'nancy');

    this.cameras.main.startFollow(this.player);

    this.physics.add.collider(this.player, groundLayer);
  }

  update(t: number, dt: number) {
    if (this.player) {
      this.player.update(this.cursors);
    }
  }
}
