import { configureStore } from '@reduxjs/toolkit';
import userSlice from './user';

const store = configureStore({
  reducer: {
    user: userSlice,
  },
});

export default store;

export type IStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type GetState = () => RootState;
