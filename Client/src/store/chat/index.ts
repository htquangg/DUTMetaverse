import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IChatMessage } from '@tlq/game/types';

export enum MessageType {
  PLAYER_JOINED,
  PLAYER_LEFT,
  REGULAR_MESSAGE,
}

interface ChatState {
  focused: boolean;
  showChat: boolean;
  chatMessages: Array<{ messageType: MessageType; chatMessage: IChatMessage }>;
}

const initialState: ChatState = {
  focused: false,
  showChat: false,
  chatMessages: new Array<{
    messageType: MessageType;
    chatMessage: IChatMessage;
  }>(),
};

export const chatSlice = createSlice({
  name: 'computer',
  initialState,
  reducers: {
    setShowChat: (state, action: PayloadAction<boolean>) => {
      state.showChat = action.payload;
    },
    setFocused: (state, action: PayloadAction<boolean>) => {
      state.focused = action.payload;
    },
    pushChatMessage: (state, action: PayloadAction<IChatMessage>) => {
      state.chatMessages.push({
        messageType: MessageType.REGULAR_MESSAGE,
        chatMessage: action.payload,
      });
    },
    pushPlayerJoinedMessage: (state, action: PayloadAction<string>) => {
      state.chatMessages.push({
        messageType: MessageType.PLAYER_JOINED,
        chatMessage: {
          createdAt: new Date().getTime(),
          author: action.payload,
          content: 'joined the lobby',
        } as IChatMessage,
      });
    },
    pushPlayerLeftMessage: (state, action: PayloadAction<string>) => {
      state.chatMessages.push({
        messageType: MessageType.PLAYER_LEFT,
        chatMessage: {
          createdAt: new Date().getTime(),
          author: action.payload,
          content: 'left the lobby',
        } as IChatMessage,
      });
    },
  },
});

export const {
  setShowChat,
  setFocused,
  pushChatMessage,
  pushPlayerJoinedMessage,
  pushPlayerLeftMessage,
} = chatSlice.actions;

export default chatSlice.reducer;
