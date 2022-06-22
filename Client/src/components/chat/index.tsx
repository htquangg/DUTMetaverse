import React, { useEffect, useRef, useState } from 'react';
import { Box, Input, Icon, Tooltip, InputProps } from '@chakra-ui/react';
import { IoHappyOutline } from 'react-icons/io5';
import styled from 'styled-components';
import Picker from 'emoji-picker-react';
import { useAppDispatch, useAppSelector } from '@tlq/hooks';
import { MessageType, setShowChat, setFocused } from '@tlq/store/chat';

import { getColorByString } from '@tlq/utils';

interface CustomInputProps extends Omit<InputProps, 'onSubmit'> {
  onEmojiClick: () => void;
  onSubmit: (value: string) => void;
}

const ChatHeader = styled.div`
  position: relative;
  height: 32px;
  background: #000000a7;
  border-radius: 10px 10px 0px 0px;
  display: flex;
  justify-content: center;
  align-items: center;

  h3 {
    color: #fff;
    font-size: 16px;
    text-align: center;
  }

  .close {
    position: absolute;
    top: 0;
    right: 0;
  }
`;

const ChatBox = styled.div`
  height: calc(100% - 100px);
  width: 100%;
  overflow: auto;
  border-radius: 10px;
`;

const MessageWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 0px 2px;

  p {
    margin: 3px;
    text-shadow: 0.3px 0.3px black;
    font-size: 15px;
    font-weight: bold;
    line-height: 1.4;
    overflow-wrap: anywhere;
  }

  span {
    color: white;
    font-weight: normal;
  }

  .notification {
    color: grey;
    font-weight: normal;
  }

  :hover {
    background: #3a3a3a;
  }
`;

const Message = ({ chatMessage, messageType }) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  return (
    <MessageWrapper
      onMouseEnter={() => {
        setTooltipOpen(true);
      }}
      onMouseLeave={() => {
        setTooltipOpen(false);
      }}
    >
      <Tooltip
        isOpen={tooltipOpen}
        label={dateFormatter.format(chatMessage.createdAt)}
        placement="right"
      >
        {messageType === MessageType.REGULAR_MESSAGE ? (
          <p
            style={{
              color: getColorByString(chatMessage.author),
            }}
          >
            {chatMessage.author}: <span>{chatMessage.content}</span>
          </p>
        ) : (
          <p className="notification">
            {chatMessage.author} {chatMessage.content}
          </p>
        )}
      </Tooltip>
    </MessageWrapper>
  );
};

const EmojiPickerWrapper = styled.div`
  position: absolute;
  bottom: 54px;
  right: 16px;
`;

const dateFormatter = new Intl.DateTimeFormat('en');

const InputMessage = React.forwardRef<HTMLInputElement, CustomInputProps>(
  (props, ref) => {
    const { onSubmit, onBlur, onKeyDown, onFocus, onEmojiClick } = props;
    // const inputRef = useRef<HTMLInputElement>(null);

    const [inputValue, setInputValue] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleOnSubmit = (event) => {
      event.preventDefault();
      // move focus back to the game
      // inputRef.current?.blur();
      const val = inputValue.trim();
      setInputValue('');
      if (val) {
        onSubmit(val);
      }
    };

    const handleEmojiClick = (_event, { emoji }) => {
      setInputValue(inputValue + emoji);
      setShowEmojiPicker(!showEmojiPicker);
      onEmojiClick();
    };

    return (
      <Box
        display="flex"
        flexDirection="row"
        pos="absolute"
        bottom={0}
        alignItems="center"
        borderRadius="0 0 10px 10px"
        background={'linear-gradient(180deg, #000000c1, #242424c0)'}
        h="14"
        w="100%"
      >
        <Input
          ref={ref}
          placeholder="Type something..."
          w="90%"
          color="white"
          border="none"
          borderRadius="none"
          borderColor="none"
          focusBorderColor="none"
          background="none"
          value={inputValue}
          onChange={(event) => {
            setInputValue(event.currentTarget.value);
            // dispatch(setFocused(true));
          }}
          onBlur={onBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleOnSubmit(e);
            } else {
              onKeyDown?.(e);
            }
          }}
          onFocus={onFocus}
        />
        <Icon
          as={IoHappyOutline}
          w="36px"
          h="36px"
          color="#42eacb"
          pos="absolute"
          right="4px"
          onClick={() => {
            setShowEmojiPicker(!showEmojiPicker);
          }}
        />
        {showEmojiPicker && (
          <EmojiPickerWrapper>
            <Picker onEmojiClick={handleEmojiClick} />
          </EmojiPickerWrapper>
        )}
      </Box>
    );
  },
);

const Chat = ({ isShow, onSubmit, ...restProps }) => {
  const dispatch = useAppDispatch();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const focused = useAppSelector((state) => state.chat.focused);
  const chatMessages = useAppSelector((state) => state.chat.chatMessages);

  useEffect(() => {
    if (focused) {
      inputRef.current?.focus();
    }
  }, [focused]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isShow]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOnBlur = () => {
    dispatch(setFocused(false));
  };

  const handleOnKeyDown = (event) => {
    if (event.key === 'Escape') {
      // move focus back to the game
      inputRef.current?.blur();
      dispatch(setFocused(false));
      dispatch(setShowChat(false));
    }
  };

  const handleOnFocus = () => {
    if (!focused) dispatch(setFocused(true));
  };

  const handleEmojiClick = () => {
    dispatch(setFocused(true));
  };

  return (
    <>
      {isShow && (
        <Box
          pos="absolute"
          bottom="90px"
          left="320px"
          height="400px"
          width="500px"
          maxH="50%"
          maxW="50%"
          background="#000000a7"
          borderRadius="10px"
          {...restProps}
        >
          <ChatHeader>
            <h3>Chat</h3>
          </ChatHeader>
          <ChatBox>
            {chatMessages.map(({ messageType, chatMessage }, index) => (
              <Message
                chatMessage={chatMessage}
                messageType={messageType}
                key={index}
              />
            ))}
            <div ref={messagesEndRef} />
            <InputMessage
              ref={inputRef}
              onSubmit={onSubmit}
              onBlur={handleOnBlur}
              onKeyDown={handleOnKeyDown}
              onFocus={handleOnFocus}
              onEmojiClick={handleEmojiClick}
            />
          </ChatBox>
        </Box>
      )}
    </>
  );
};

export default React.memo(Chat);
