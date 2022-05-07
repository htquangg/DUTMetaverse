import React from 'react';
import { chakra } from '@chakra-ui/react';
import Dialog from './Dialog';

const WhiteboardDialog = (props) => {
  const { whiteboardUrl, onOpen, onClose, ...rest } = props;

  return (
    <Dialog rightTitle="Close" onOpen={onOpen} onClose={onClose} {...rest}>
      <iframe
        title="white board"
        src={whiteboardUrl}
        width="100%"
        height="100%"
      />
    </Dialog>
  );
};

const StyledWhiteboardDialog = chakra(WhiteboardDialog);

export default React.memo(StyledWhiteboardDialog);
