import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WhiteboardState {
  isOpen: boolean;
  itemID: string | null;
  url: string | null;
  urls: Map<string, string>;
}
const initialState: WhiteboardState = {
  isOpen: false,
  itemID: null,
  url: null,
  urls: new Map(),
};

export const whiteboardSlice = createSlice({
  name: 'whiteboard',
  initialState,
  reducers: {
    openWhiteboardDialog: (state, action) => {
      state.isOpen = true;
      state.itemID = action.payload;
      const url = state.urls.get(action.payload);
      if (url) {
        state.url = url;
      }
    },
    closeWhiteboardDialog: (state) => {
      state.isOpen = false;
      state.itemID = null;
    },
    setWhiteboardUrls: (
      state,
      action: PayloadAction<{ whiteboardID: string; roomID: string }>,
    ) => {
      state.urls.set(
        action.payload.whiteboardID,
        `https://www.tldraw.com/r/dut-tlq-${action.payload.roomID}`,
      );
    },
  },
});

export const {
  openWhiteboardDialog,
  closeWhiteboardDialog,
  setWhiteboardUrls,
} = whiteboardSlice.actions;

export default whiteboardSlice.reducer;
