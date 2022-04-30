import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Peer from 'peerjs';
import { sanitizeId } from '@tlq/utils';
import ShareScreenManager from '@tlq/game/features/webRTC/ShareScreenManager';

interface ComputerState {
  isOpen: boolean;
  itemID: string | null;
  myStream: MediaStream | null;
  peerStreams: Map<
    string,
    {
      stream: MediaStream;
      call: Peer.MediaConnection;
    }
  >;
  shareScreenManager: ShareScreenManager | null;
}

const initialState: ComputerState = {
  isOpen: false,
  itemID: null,
  myStream: null,
  peerStreams: new Map(),
  shareScreenManager: null,
};

export const computerSlice = createSlice({
  name: 'computer',
  initialState,
  reducers: {
    openDialog: (
      state,
      action: PayloadAction<{ itemID: string; userID: string }>,
    ) => {
      if (!state.shareScreenManager) {
        state.shareScreenManager = new ShareScreenManager(
          action.payload.userID,
        );
      }
      state.isOpen = true;
      state.itemID = action.payload.itemID;
      state.shareScreenManager.onOpen();
    },
    closeDialog: (state) => {
      for (const { call } of state.peerStreams.values()) {
        call.close();
      }
      state.shareScreenManager?.onClose();
      state.isOpen = false;
      state.myStream = null;
      state.itemID = null;
      state.peerStreams.clear();
    },
    setStream: (state, action) => {
      state.myStream = action.payload;
    },
    addVideoStream: (state, action) => {
      state.myStream = action.payload.stream;
      state.peerStreams.set(sanitizeId(action.payload.id), {
        call: action.payload.call,
        stream: action.payload.stream,
      });
    },
    removeVideoStream: (state, action) => {
      state.myStream = null;
      state.peerStreams.delete(sanitizeId(action.payload));
    },
  },
});

export const {
  openDialog,
  closeDialog,
  setStream,
  addVideoStream,
  removeVideoStream,
} = computerSlice.actions;

export default computerSlice.reducer;
