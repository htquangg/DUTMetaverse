import React from 'react';
import {
  IconButton,
  Avatar,
  Box,
  Flex,
  HStack,
  VStack,
  useColorModeValue,
  Text,
  FlexProps,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';
import { FiMenu, FiBell, FiChevronDown } from 'react-icons/fi';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import { LoginFbButton } from '@tlq/components/button';
import { FacebookResponse } from '@tlq/types';
import { UserInfoProps } from '@tlq/store/user';
import { TlqLocalStorage } from '@tlq/localstorage';

interface MobileProps extends FlexProps {
  onOpen: () => void;
  onClickLogout: () => void;
  user: UserInfoProps;
  responseFacebook: (data: FacebookResponse) => void;
}

const Header = ({
  onOpen,
  user,
  responseFacebook,
  onClickLogout,
  ...rest
}: MobileProps) => {
  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('green.900', 'gray.700')}
      justifyContent={{ base: 'space-between', md: 'flex-end' }}
      {...rest}
    >
      <IconButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
      />

      <Text
        display={{ base: 'flex', md: 'none' }}
        fontSize="2xl"
        fontFamily="monospace"
        fontWeight="bold"
      >
        DUT Meta
      </Text>

      {user && user.name && user.socialId ? (
        <HStack spacing={{ base: '0', md: '6' }}>
          <Flex alignItems={'center'}>
            <Menu>
              <MenuButton
                py={2}
                transition="all 0.3s"
                _focus={{ boxShadow: 'none' }}
              >
                <HStack>
                  <Avatar size={'sm'} src={user.avatar} />
                  <VStack
                    display={{ base: 'none', md: 'flex' }}
                    alignItems="flex-start"
                    spacing="1px"
                    ml="2"
                  >
                    <Text fontSize="sm">{user.name}</Text>
                  </VStack>
                  <Box display={{ base: 'none', md: 'flex' }}>
                    <FiChevronDown />
                  </Box>
                </HStack>
              </MenuButton>
              <MenuList
                bg={useColorModeValue('white', 'gray.900')}
                borderColor={useColorModeValue('gray.200', 'gray.700')}
              >
                <MenuItem onClick={onClickLogout}>Sign out</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </HStack>
      ) : (
        <Flex justifyContent={'center'} alignItems={'center'}>
          <FacebookLogin
            appId={process.env.FACEBOOK_APP_ID}
            fields="name,email,picture,first_name,last_name"
            callback={responseFacebook}
            onFailure={(error) => console.log('@@@ error login fb', error)}
            isMobile={false}
            // version="v2.7"
            scope="public_profile,user_friends"
            disableMobileRedirect={true}
            render={(renderProps) => (
              <LoginFbButton
                onClick={() => {
                  renderProps.onClick();
                }}
              />
            )}
          />
        </Flex>
      )}
    </Flex>
  );
};

export default React.memo(Header);
