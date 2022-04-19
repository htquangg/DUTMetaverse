import React, { ReactNode, useState, useEffect } from 'react';
import { Box, useColorModeValue, useDisclosure } from '@chakra-ui/react';
import { Header, Sidebar } from '@tlq/components';
import Phaser from 'phaser';
// import PhaserGame from '@tlq/game/phaserGame';
import { Preload, Background, Game } from '@tlq/game/scenes';

import './App.css';

const App = ({ children }: { children: ReactNode }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [game, setGame] = useState<Phaser.Game>();

  useEffect(() => {
    if (game) {
      return;
    }

    const phaserGame = new Phaser.Game({
      type: Phaser.AUTO,
      parent: 'game-content',
      scale: {
        width: window.innerWidth,
        height: window.innerHeight,
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
  }, [game]);

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
      <Sidebar isOpen={isOpen} onClose={onClose} children={undefined} />
      <Header onOpen={onOpen} />
      <Box
        ml={{ base: 0, md: 60 }}
        p="4"
        height="calc(100vh - 80px)"
      >
        {children}
      </Box>
    </Box>
  );
};

export default App;
