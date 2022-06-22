import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  chakra,
  Box,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Header, Sidebar } from '@tlq/components';
import { useAppSelector, useAppDispatch } from '@tlq/hooks';
import { ModalLogin } from '@tlq/components/modal';
import {
  setUserInfo,
  setLoggedIn,
  logout,
  updateUserInfo,
} from '@tlq/store/user';

import './style.css';
import { Game } from '@tlq/game/scenes';

import get from 'lodash/get';
import { FacebookResponse } from '@tlq/types';
import { TlqLocalStorage } from '@tlq/localstorage';
import { LOCAL_STORAGE } from '@tlq/constants';
import { UserService } from '@tlq/services/user';

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
    window.onbeforeunload = (event: Event) => {
      event.preventDefault();
      const player = TlqLocalStorage.getItem(LOCAL_STORAGE.USER);
      const accessToken = player.accessToken;
      delete player.accessToken;
      TlqLocalStorage.setItem(LOCAL_STORAGE.USER, player);
      const [x, y] = gameScene.getPositionMyPlayer();
      const playerID = TlqLocalStorage.getItem(LOCAL_STORAGE.PLAYER_ID);
      const data = {
        playerID,
        x: Math.round(x),
        y: Math.round(y),
      };
      UserService.updateProfileFetch(accessToken, data);
    };
  }, [gamePhaser, gameScene]);

  useEffect(() => {
    if (!gamePhaser || !gameScene) return;

    const getUser = async (
      playerID: string,
      secretKey: string,
      name: string,
    ) => {
      const accessTokenPromise = await UserService.getAccessToken({
        playerID,
        secretKey,
        name,
      });
      const playerProfilePromise = await UserService.getProfile({ playerID });

      const [accessTokenRes, playerProfileRes] = await Promise.all([
        accessTokenPromise,
        playerProfilePromise,
      ]);

      return {
        accessToken: accessTokenRes,
        ...get(playerProfileRes, 'data.data', {}),
      };
    };
    if (localUser && localUser.name !== '') {
      const playerID = TlqLocalStorage.getItem(LOCAL_STORAGE.PLAYER_ID);
      const secretKey = TlqLocalStorage.getItem(LOCAL_STORAGE.SECRET_KEY);
      const name = localUser.name;

      getUser(playerID, secretKey, name).then((user) => {
        try {
          if (user && user.accessToken) {
            console.log('user: ', user, localUser);
            gameScene.setNamePlayer(user.name);
            gameScene.setSkinPlayer(localUser.skin);
            gameScene.updateMyPlayer(user.x, user.y);
            dispatch(updateUserInfo({ accessToken: user.accessToken }));
          }
        } catch (error) {
          window.onbeforeunload = null;
          window.location.reload();
        }
      });
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
        friends: get(response, 'friends.data', []),
        playerID: uuidv4(),
        secretKey: uuidv4(),
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

    const userInfo = {
      name,
      skin,
      playerID: uuidv4(),
      secretKey: uuidv4(),
    };

    dispatch(setUserInfo(userInfo));

    TlqLocalStorage.setItem(
      LOCAL_STORAGE.PLAYER_ID,
      JSON.stringify(userInfo.playerID),
    );
    TlqLocalStorage.setItem(
      LOCAL_STORAGE.SECRET_KEY,
      JSON.stringify(userInfo.secretKey),
    );

    UserService.getAccessToken(userInfo).then((accessToken: string) => {
      gameScene.setNamePlayer(name);
      gameScene.setSkinPlayer(skin);
      dispatch(updateUserInfo({ accessToken }));
    });
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
