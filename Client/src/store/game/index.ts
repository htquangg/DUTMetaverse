import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Phaser from 'phaser';

export interface PhaserGameState {
  gamePhaser?: Phaser.Game;
  gameCanvas?: HTMLCanvasElement;
  preloadScene?: Phaser.Scene;
  gameScene?: Phaser.Scene;
}

const initialState: PhaserGameState = {
  gamePhaser: undefined,
  gameCanvas: undefined,
  preloadScene: undefined,
  gameScene: undefined,
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setGameCanvas: (state, action) => {
      state.gameCanvas = action.payload;
    },
    setGamePhaser: (state, action) => {
      state.gamePhaser = action.payload;
    },
    setPreloadScene: (state, action) => {
      state.preloadScene = action.payload;
    },
    setGameScene: (state, action) => {
      state.gameScene = action.payload;
    },
  },
});

export const { setGameCanvas, setGamePhaser, setGameScene, setPreloadScene } =
  gameSlice.actions;

export default gameSlice.reducer;
