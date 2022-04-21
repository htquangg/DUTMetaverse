import React from 'react';
import { IconType } from 'react-icons';

import {
  FiHome,
  FiTrendingUp,
  FiCompass,
  FiStar,
  FiSettings,
} from 'react-icons/fi';

interface LinkItemProps {
  path: string;
  name: string;
  icon: IconType;
  children?: Omit<LinkItemProps, 'icon'>[];
}

export const HOME_SIDER_MENU_LIST: Array<LinkItemProps> = [
  {
    path: '/home/index',
    name: 'Home',
    icon: FiHome,
  },
  {
    path: '/home/trending',
    name: 'Trending',
    icon: FiTrendingUp,
  },
];
