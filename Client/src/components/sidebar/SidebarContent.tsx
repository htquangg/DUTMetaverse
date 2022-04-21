import React from 'react';
import {
  Box,
  Flex,
  Text,
  CloseButton,
  BoxProps,
  useColorModeValue,
} from '@chakra-ui/react';
import { HOME_SIDER_MENU_LIST } from '@tlq/constants';
import SidebarItem from './SidebarItem';

interface SidebarProps extends BoxProps {
  onClose: () => void;
}

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
  return (
    <Box
      transition="3s ease"
      bg={useColorModeValue('white', 'gray.900')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
          DUT Meta
        </Text>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      {HOME_SIDER_MENU_LIST.map((link) => (
        <SidebarItem key={link.name} icon={link.icon} path={link.path}>
          {link.name}
        </SidebarItem>
      ))}
    </Box>
  );
};

export default SidebarContent;
