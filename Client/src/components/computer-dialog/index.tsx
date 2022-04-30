import React from 'react';
import {
  chakra,
  Stack,
  Box,
  useColorModeValue,
  Button,
} from '@chakra-ui/react';
import Video from '@tlq/components/video';

const StyledVideo = chakra(Video);

const VideoContainer = ({ stream, ...props }) => {
  return (
    <Box {...props}>
      <StyledVideo srcObject={stream} autoPlay w="100%" h="100%" />
    </Box>
  );
};

const ComputerDialog = ({ stream, playerName, onOpen, onClose }) => {
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
    >
      <Stack
        h="10%"
        direction="row"
        justifyContent="space-between"
        mb={4}
        alignItems="center"
      >
        <Box w="20%" pt={2}>
          <Button w="full" colorScheme="green" onClick={onOpen}>
            {stream ? 'Stop Sharing' : 'Share Screen'}
          </Button>
        </Box>
        <Box w="10%" pt={2}>
          <Button w="full" colorScheme="red" onClick={onClose}>
            Close
          </Button>
        </Box>
      </Stack>
      {stream ? (
        <VideoContainer stream={stream} w="100%" h="85%" borderRadius="10px" />
      ) : (
        <Box w="100%" h="85%" bg="gray.500" borderRadius="10px"></Box>
      )}
    </Box>
  );
};

export default ComputerDialog;
