import React, { useState, useEffect } from 'react';
import Phaser from 'phaser';
import { Preload, Background, Game } from '@tlq/game/scenes';

import { Box } from '@chakra-ui/react';

import './styles.css'

const GameContainer = () => {
  const [game, setGame] = useState<Phaser.Game>();

  useEffect(() => {
    if (game) return;

    const phaserGame = new Phaser.Game({
      type: Phaser.AUTO,
      parent: 'game-content',
      scale: {
        autoCenter: Phaser.Scale.CENTER_BOTH,
        mode: Phaser.Scale.ScaleModes.RESIZE,
      },
      pixelArt: true, // Prevent pixel art from becoming blurred when scaled.
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
      scene: [Preload, Background, Game],
    });

    setGame(phaserGame);
  }, []);
  return (
    <>
      <Box
        id="game-content"
        key="game-content"
        w={{ base: 'full', xl: 'calc(100vw - 250px)' }}
        h="100%"
        overflow="hidden"
      ></Box>
      <Box
        display={{ base: 'none', xl: 'block' }}
        className="video-grid"
        w={{ base: 0, xl: '250px' }}
      ></Box>
    </>
  );
};

export default GameContainer;
