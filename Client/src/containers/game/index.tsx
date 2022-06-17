import React, { useState, useEffect, useCallback } from 'react';
import Phaser from 'phaser';
import { Box,Icon } from '@chakra-ui/react';
import {
  IoChatboxEllipsesOutline,
  IoChatboxOutline,
} from 'react-icons/io5';
import { Preload, Background, Game } from '@tlq/game/scenes';
import { useAppDispatch, useAppSelector } from '@tlq/hooks';
import './styles.css';
import { setGamePhaser, setPreloadScene, setGameScene } from '@tlq/store/game';
import { SceneType } from '@tlq/game/types';
// import ComputerDialog from '@tlq/components/computer-dialog';
import { ComputerDialog, WhiteboardDialog } from '@tlq/components/dialog';
import { closeDialog } from '@tlq/store/computer';
import { closeWhiteboardDialog } from '@tlq/store/whiteboard';
import Chat from '@tlq/components/chat';
import { setShowChat } from '@tlq/store/chat';
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
  const computerStream = useAppSelector((state) => state.computer.myStream);

  const isWhiteboardOpen = useAppSelector((state) => state.whiteboard.isOpen);
  const whiteboardID = useAppSelector((state) => state.whiteboard.itemID);
  const whiteboardUrl = useAppSelector((state) => state.whiteboard.url);

  const chatFocused = useAppSelector((state) => state.chat.focused);
  const showChat = useAppSelector((state) => state.chat.showChat);

  const gamePhaser = useAppSelector((state) => state.game.gamePhaser);
  const gameScene = useAppSelector((state) => state.game.gameScene) as Game;

  useEffect(() => {
    if (!gamePhaser || !gameScene) return;

    if (chatFocused) {
      gameScene.disableKeys();
    } else {
      gameScene.enableKeys();
    }
  }, [chatFocused]);

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
          const gameScene = game.scene.keys[SceneType.GAME];

          gameScene.events.on('create', (_gameScene: Game) => {
            dispatch(setGameScene(_gameScene));
            dispatch(setGamePhaser(game));
          });

          gameScene.events.on('resume', (_gameScene: Game) => {
            dispatch(setGameScene(_gameScene));
            dispatch(setGamePhaser(game));
          });
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
    if (computerID) {
      if (computerStream) {
        gameScene?.stopShareScreen(computerID);
      } else {
        gameScene?.startShareScreen(computerID);
      }
    }
  };

  const handleCloseComputer = () => {
    console.error('[GameContainer] handle close computer: ', computerID);
    if (computerID) {
      gameScene.disconnectFromComputer(computerID);
    }
    gameScene.enableKeys();
    dispatch(closeDialog());
  };

  const handleOpenWhiteboard = () => {
    if (whiteboardID) {
      // TODO
    }
  };

  const handleCloseWhiteboard = () => {
    console.error('[GameContainer] handle close whiteboard: ', whiteboardID);
    if (whiteboardID) {
      gameScene.disconnectFromWhiteboard(whiteboardID);
    }
    gameScene.enableKeys();
    dispatch(closeWhiteboardDialog());
  };

  const handleSubmit = (value: string) => {
    gameScene.addChatMessage(value);
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
            stream={computerStream}
            playerName="you"
            onOpen={handleOpenComputer}
            onClose={handleCloseComputer}
          />
        )}
        {isWhiteboardOpen && (
          <WhiteboardDialog
            whiteboardUrl={whiteboardUrl}
            onOpen={handleOpenWhiteboard}
            onClose={handleCloseWhiteboard}
          />
        )}
      </Box>
      <Box pos="absolute" bottom="80px" left="300px">
        <Icon
          as={showChat ? IoChatboxOutline : IoChatboxEllipsesOutline}
          w="36px"
          h="36px"
          color="green.900"
          pos="absolute"
          onClick={() => {
            dispatch(setShowChat(!showChat));
          }}
        />
      </Box>
      <Chat onSubmit={handleSubmit} isShow={showChat}/>
      <Box
        display={{ base: 'none', xl: 'block' }}
        className="video-grid"
        w={{ base: 0, xl: '250px' }}
      ></Box>
    </>
  );
};

export default GameContainer;
