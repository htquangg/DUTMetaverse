import React from 'react';
import { useRoutes } from 'react-router-dom';
import { PrivateRoute } from '@tlq/components';
import { MainEntry } from '@tlq/containers';
import { LoginContainer, GameContainer, DK4Container } from '@tlq/containers';

const MainRoutes = () => {
  const _Login = (
    <PrivateRoute
      element={LoginContainer}
      meta={{
        title: 'Login',
      }}
    />
  );

  const elements = useRoutes([
    {
      path: '/',
      element: _Login,
    },
    {
      path: '/login',
      element: _Login,
    },
    {
      path: '/home',
      element: <MainEntry />,
      children: [
        {
          path: '',
          element: (
            <PrivateRoute
              element={GameContainer}
              meta={{
                requiresAuth: false,
                title: 'Home',
              }}
            />
          ),
        },
        {
          path: 'index',
          element: (
            <PrivateRoute
              element={GameContainer}
              meta={{
                requiresAuth: false,
                title: 'Home',
              }}
            />
          ),
        },
        {
          path: 'trending',
          element: (
            <PrivateRoute
              element={DK4Container}
              meta={{
                requiresAuth: false,
                title: 'Trending',
              }}
            />
          ),
        },
      ],
    },
  ]);

  return elements;
};

export default MainRoutes;
