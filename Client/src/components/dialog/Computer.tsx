import React from 'react';
import { chakra } from '@chakra-ui/react';
import Video from '@tlq/components/video';
import Dialog from './Dialog';

const StyledVideo = chakra(Video);

const VideoContainer = ({ stream, ...props }) => {
  return <StyledVideo srcObject={stream} autoPlay w="100%" h="100%" />;
};

const ComputerDialog = (props) => {
  const { stream, playerName, onOpen, onClose, ...rest } = props;

  return (
    <Dialog
      leftTitle={stream ? 'Stop Sharing' : 'Share Screen'}
      rightTitle="Close"
      onOpen={onOpen}
      onClose={onClose}
      {...rest}
    >
      {stream ? <VideoContainer stream={stream} /> : null}
    </Dialog>
  );
};

const StyledComputerDialog = chakra(ComputerDialog);

export default React.memo(StyledComputerDialog);
