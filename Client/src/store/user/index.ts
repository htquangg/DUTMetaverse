import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { isPlainObject } from 'lodash';
import { LOCAL_STORAGE } from '@tlq/constants';
import { TlqLocalStorage } from '@tlq/localstorage';

export interface UserInfoProps {
  sessionID: string | undefined;
  userName: string;
}

export interface UserState {
  isLogin: boolean;
  userInfo: UserInfoProps;
}

let localUser: UserInfoProps | undefined = undefined;
try {
  const r = JSON.parse(TlqLocalStorage.getItem(LOCAL_STORAGE.USER) as string);
  if (isPlainObject(r)) {
    localUser = r;
  }
} catch {
  throw new Error("User isn't login!!!");
}

const initialState: UserState = {
  isLogin: !!localUser,
  userInfo: localUser || {
    sessionID: undefined,
    userName: '',
  },
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserInfo: (state, action: PayloadAction<UserInfoProps>) => {
      const userInfo = action.payload;
      if (userInfo && userInfo.sessionID) {
        state.isLogin = true;
        TlqLocalStorage.setItem(LOCAL_STORAGE.USER, JSON.stringify(userInfo));
      }
      state.userInfo = userInfo;
    },
  },
});

export const { setUserInfo } = userSlice.actions;

export default userSlice.reducer;
