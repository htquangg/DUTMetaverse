import React, { useState, useEffect } from 'react';
import { Drawer, DrawerContent } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import { HOME_SIDER_MENU_LIST } from '@tlq/constants';
import SidebarContent from './SidebarContent';

const Sidebar = ({
  isOpen,
  onClose,
  ...rest
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const location = useLocation();
  const [selectedKeys, setSelectedKeys] = useState('');
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  useEffect(() => {
    const pathname = location.pathname;
    const fragment = pathname.split('/').slice(0, 3);
    const prefixPath = fragment.join('/');
    if (fragment.length === 3) {
      for (let i = 0; i < HOME_SIDER_MENU_LIST.length; i++) {
        const menu = HOME_SIDER_MENU_LIST[i];
        if (Array.isArray(menu.children)) {
          const findIdx = menu.children.findIndex(
            (menu) => pathname === menu.path,
          );
          if (findIdx !== -1) {
            setSelectedKeys(menu.children[findIdx].path);
            setOpenKeys([menu.name]);
            break;
          }
        }
        if (menu.path.indexOf(prefixPath) !== -1) {
          setSelectedKeys(menu.path);
          break;
        }
      }
    }
  }, [location.pathname]);

  return (
    <>
      <SidebarContent
        onClose={() => onClose}
        display={{ base: 'none', md: 'block' }}
        {...rest}
      />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Sidebar;
