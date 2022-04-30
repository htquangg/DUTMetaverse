import React, { useState, useEffect, useCallback } from 'react';
import Phaser from 'phaser';
import { Box } from '@chakra-ui/react';
import { Preload, Background, Game } from '@tlq/game/scenes';
import { useAppDispatch, useAppSelector } from '@tlq/hooks';
import './styles.css';
import { setGamePhaser, setPreloadScene, setGameScene } from '@tlq/store/game';
import { SceneType } from '@tlq/game/types';
import ComputerDialog from '@tlq/components/computer-dialog';
import { closeDialog } from '@tlq/store/computer';
// import "@tlq/game/phaserGame";

// hard code phaserGame
declare global {
  interface Window {
    game: Phaser.Game;
  }
}

const GameContainer = () => {
  const [game, setGame] = useState<Phaser.Game>();

  const dispatch = useAppDispatch();

  const isComputerOpen = useAppSelector((state) => state.computer.isOpen);
  const computerID = useAppSelector((state) => state.computer.itemID);
  const myStream = useAppSelector((state) => state.computer.myStream);
  const shareScreenManager = useAppSelector(
    (state) => state.computer.shareScreenManager,
  );

  const gamePhaser = useAppSelector((state) => state.game.gamePhaser);
  const gameScene = useAppSelector((state) => state.game.gameScene) as Game;

  useEffect(() => {
    if (game) return;

    const phaserGame = new Phaser.Game({
      type: Phaser.AUTO,
      parent: 'game-content',
      scale: {
        autoCenter: Phaser.Scale.CENTER_BOTH,
        mode: Phaser.Scale.ScaleModes.RESIZE,
      },
      render: {
        antialias: false,
        pixelArt: true,
        roundPixels: true,
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
      scene: [Preload, Background, Game],
      callbacks: {
        postBoot: (game) => {
          const preloadScene = game.scene.keys[SceneType.PRELOAD];
          const gameScene = game.scene.keys[SceneType.GAME];

          gameScene.events.on('create', (_gameScene: Game) => {
            dispatch(setGameScene(_gameScene));
          });

          preloadScene.events.on('create', (_preloadScene: Preload) => {
            dispatch(setGameScene(_preloadScene));
          });

          dispatch(setGamePhaser(game));
        },
      },
    });

    setGame(phaserGame);
  }, [game]);

  useEffect(() => {
    if (!game || !gameScene) return;

    return () => {
      gameScene.leave();
      game.destroy(true, false);
      dispatch(setGameScene(undefined));
      dispatch(setGameScene(undefined));
      dispatch(setGamePhaser(undefined));
    };
  }, [game, gameScene]);

  const handleOpenComputer = () => {
    if (shareScreenManager?.myStream) {
      shareScreenManager.stopScreenShare();
    } else {
      shareScreenManager?.startScreenShare();
    }
  };

  const handleCloseComputer = () => {
    console.error('handleClosecomputer: ', computerID);
    if (computerID) {
      gameScene.disconnectFromComputer(computerID);
    }
    gameScene.enableKeys();
    dispatch(closeDialog());
  };

  return (
    <>
      <Box
        id="game-content"
        key="game-content"
        w={{ base: 'full', xl: 'calc(100vw - 250px)' }}
        h="100%"
        overflow="hidden"
        position="relative"
        borderWidth="2px"
        borderRadius="5px"
        borderStyle="solid"
        borderColor="green.700"
      >
        {isComputerOpen && (
          <ComputerDialog
            stream={myStream}
            playerName="you"
            onOpen={handleOpenComputer}
            onClose={handleCloseComputer}
          />
        )}
      </Box>
      <Box
        display={{ base: 'none', xl: 'block' }}
        className="video-grid"
        w={{ base: 0, xl: '250px' }}
      ></Box>
    </>
  );
};

export default GameContainer;
