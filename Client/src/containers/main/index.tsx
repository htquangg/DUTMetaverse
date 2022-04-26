import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  chakra,
  Box,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import { Header, Sidebar } from '@tlq/components';
import { useAppSelector, useAppDispatch } from '@tlq/hooks';
import { ModalLogin } from '@tlq/components/modal';

import { setUserInfo, setLoggedIn } from '@tlq/store/user';

import './style.css';
import { Game } from '@tlq/game/scenes';

const StyledSidebar = chakra(Sidebar);

const App = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { onClose: onCloseModal } = useDisclosure();

  const dispatch = useAppDispatch();

  const isLogin = useAppSelector((state) => state.user.isLogin);
  const localUser = useAppSelector((state) => state.user.userInfo);

  const gamePhaser = useAppSelector((state) => state.game.gamePhaser);
  const gameScene = useAppSelector((state) => state.game.gameScene) as Game;

  useEffect(() => {
    if (!gamePhaser || !gameScene) return;

    if (localUser) {
      gameScene.setNamePlayer(localUser.name);
      gameScene.setSkinPlayer(localUser.skin);
    }
  }, [gamePhaser, gameScene]);

  const handleOnSubmit = (name: string, skin: string) => {
    if (!gamePhaser || !gameScene) return;
    // TODO
    gameScene.setNamePlayer(name);
    gameScene.setSkinPlayer(skin);
    dispatch(setUserInfo({ name, skin }));
  };

  return (
    <>
      <Box
        pos="relative"
        w="100%"
        h="100%"
        bg={useColorModeValue('gray.100', 'gray.900')}
      >
        {!isLogin && (
          <ModalLogin
            isOpen={!isLogin}
            onClose={onCloseModal}
            onSubmit={handleOnSubmit}
          />
        )}
        <StyledSidebar
          isOpen={isOpen}
          onClose={onClose}
          borderRightColor="green.700"
          borderRightWidth="1px"
          borderRightStyle="solid"
        />
        <Header onOpen={onOpen} />
        <Box
          ml={{ base: 0, md: 60 }}
          p="4"
          height="calc(100vh - 80px)"
          display="flex"
        >
          <Outlet />
        </Box>
      </Box>
    </>
  );
};

export default App;
