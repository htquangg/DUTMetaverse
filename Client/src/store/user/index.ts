import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { isPlainObject } from 'lodash';
import { LOCAL_STORAGE } from '@tlq/constants';
import { TlqLocalStorage } from '@tlq/localstorage';

export interface UserInfoProps {
  name: string;
  skin: string;
}

export interface UserState {
  isLogin: boolean;
  sessionID: string | undefined;
  userInfo: UserInfoProps;
}

const getLocalUser = (): UserInfoProps | undefined => {
  try {
    let localUser: UserInfoProps | undefined = undefined;
    const r = JSON.parse(
      JSON.stringify(TlqLocalStorage.getItem(LOCAL_STORAGE.USER)),
    );
    if (isPlainObject(r)) {
      localUser = r;
    }

    return localUser;
  } catch {
    // TODO
  }
};

const localUser = getLocalUser();

console.error('[StoreUser] localUser: ', !!localUser);

const initialState: UserState = {
  isLogin: !!localUser,
  sessionID: undefined,
  userInfo: localUser || {
    name: '',
    skin: '',
  },
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserInfo: (state, action: PayloadAction<UserInfoProps>) => {
      const userInfo = action.payload;
      if (userInfo && userInfo.name) {
        console.error('[StoreUser] userInfo: ', userInfo);
        state.isLogin = true;
        TlqLocalStorage.setItem(LOCAL_STORAGE.USER, JSON.stringify(userInfo));
      }
      state.userInfo = userInfo;
    },
    setLoggedIn: (state, action: PayloadAction<boolean>) => {
      state.isLogin = action.payload;
    },
    setSessionID: (state, action: PayloadAction<string>) => {
      state.sessionID = action.payload;
    },
  },
});

export const { setUserInfo, setLoggedIn, setSessionID } = userSlice.actions;

export default userSlice.reducer;
