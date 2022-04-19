import React, { useEffect } from 'react';
import { Box, useColorModeValue, useDisclosure } from '@chakra-ui/react';
import { Header, Sidebar } from '@tlq/components';
import Phaser from 'phaser';
import { Preload, Background, Game } from '@tlq/game/scenes';

import './App.css';

const App = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  console.error('who call me');

  useEffect(() => {
    new Phaser.Game({
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

    console.error('@@@@ use effect');
    // setGame(phaserGame);
  }, []);

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
      <Sidebar isOpen={isOpen} onClose={onClose} children={undefined} />
      <Header onOpen={onOpen} />
      <Box ml={{ base: 0, md: 60 }} p="4" height="calc(100vh - 80px)">
        <div id="game-content" key="game-content"></div>
      </Box>
    </Box>
  );
};

export default App;
