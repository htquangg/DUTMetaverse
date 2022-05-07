import React from 'react';
import {
  chakra,
  Stack,
  Box,
  useColorModeValue,
  Button,
} from '@chakra-ui/react';

const Dialog = (props) => {
  const {
    leftTitle,
    rightTitle,
    onOpen,
    onClose,
    styleHeader,
    styleBody,
    children,
    ...rest
  } = props;

  return (
    <Box
      bg={useColorModeValue('gray.700', 'whiteAlpha.100')}
      boxShadow={'xl'}
      rounded={'lg'}
      p={6}
      w="90%"
      h="90%"
      zIndex={999}
      position="absolute"
      top="5%"
      left="5%"
      {...rest}
    >
      <Stack
        h="10%"
        direction="row"
        justifyContent="space-between"
        flexDirection={leftTitle ? 'row' : 'row-reverse'}
        mb={4}
        alignItems="center"
        style={styleHeader}
      >
        {leftTitle && (
          <Box w="20%" pt={2}>
            <Button w="full" colorScheme="green" onClick={onOpen}>
              {leftTitle}
            </Button>
          </Box>
        )}
        {rightTitle && (
          <Box w="10%" pt={2}>
            <Button w="full" colorScheme="red" onClick={onClose}>
              {rightTitle}
            </Button>
          </Box>
        )}
      </Stack>
      {children ? (
        <Box w="100%" h="85%" borderRadius="10px" style={styleBody}>
          {children}
        </Box>
      ) : (
        <Box
          w="100%"
          h="85%"
          bg="gray.500"
          borderRadius="10px"
          style={styleBody}
        ></Box>
      )}
    </Box>
  );
};

const StyledDialog = chakra(Dialog);

export default React.memo(StyledDialog);
