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

import { setUserInfo, setLoggedIn, logout } from '@tlq/store/user';

import './style.css';
import { Game } from '@tlq/game/scenes';

import _ from 'lodash';
import { FacebookResponse } from '@tlq/types';
import { TlqLocalStorage } from '@tlq/localstorage';
import { LOCAL_STORAGE } from '@tlq/constants';

const StyledSidebar = chakra(Sidebar);

const App = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { onClose: onCloseModal } = useDisclosure();

  const dispatch = useAppDispatch();

  const isLogin = useAppSelector((state) => state.user.isLogin);
  const localUser = useAppSelector((state) => state.user.userInfo);
  const isComputerOpen = useAppSelector((state) => state.computer.isOpen);

  const gamePhaser = useAppSelector((state) => state.game.gamePhaser);
  const gameScene = useAppSelector((state) => state.game.gameScene) as Game;

  useEffect(() => {
    if (!gamePhaser || !gameScene) return;

    if (localUser) {
      gameScene.setNamePlayer(localUser.name);
      gameScene.setSkinPlayer(localUser.skin);
    }
  }, [gamePhaser, gameScene]);

  const handleResponseFacebook = (response: FacebookResponse) => {
    if (!gamePhaser || !gameScene) return;

    if (response.accessToken) {
      const { accessToken: socialToken, id: socialId } = response;
      const userInfo = {
        name: `${response.first_name} ${response.last_name}`,
        skin:
          TlqLocalStorage.getItem(LOCAL_STORAGE.USER)?.skin || response.skin,
        socialToken,
        socialId,
        avatar: response?.picture?.data?.url,
        friends: _.get(response, 'friends.data', []),
      };
      gameScene.setNamePlayer(userInfo.name);
      gameScene.setSkinPlayer(userInfo.skin);
      dispatch(setUserInfo(userInfo));
    }
  };

  const handleClickLogout = () => {
    if ((window as any).FB) {
      (window as any).FB.logout();
    }
    const emptyUser = {
      name: '',
      skin: '',
    };
    dispatch(logout(emptyUser));
  };

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
            responseFacebook={handleResponseFacebook}
          />
        )}
        <StyledSidebar
          isOpen={isOpen}
          onClose={onClose}
          borderRightColor="green.700"
          borderRightWidth="1px"
          borderRightStyle="solid"
        />
        {localUser && localUser.name && (
          <Header
            onOpen={onOpen}
            user={localUser}
            responseFacebook={handleResponseFacebook}
            onClickLogout={handleClickLogout}
          />
        )}
        <Box
          ml={{ base: 0, md: 60 }}
          p="4"
          height={localUser && localUser.name ? 'calc(100vh - 80px)' : '100vh'}
          display="flex"
        >
          <Outlet />
        </Box>
      </Box>
    </>
  );
};

export default App;
