import { configureStore } from '@reduxjs/toolkit';
import { enableMapSet } from 'immer';
import userSlice from './user';
import gameSlice from './game';
import computerSlice from './computer';

enableMapSet();

const store = configureStore({
  reducer: {
    user: userSlice,
    game: gameSlice,
    computer: computerSlice,
  },
  // Temporary disable serialize check for redux as we store MediaStream in ComputerStore.
  // https://stackoverflow.com/a/63244831
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;

export type IStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type GetState = () => RootState;
