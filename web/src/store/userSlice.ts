import {
  createSlice,
  type CaseReducer,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type { TokenRefresh_Response, User_Client } from '@shared/user';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

interface UserStore extends Partial<TokenRefresh_Response> {}
const initialState: UserStore = {};

const setProfile: CaseReducer<UserStore, PayloadAction<User_Client>> = (
  state,
  action
) => {
  state.profile = action.payload;
};
const setTokenRefresh: CaseReducer<
  UserStore,
  PayloadAction<TokenRefresh_Response | undefined>
> = (state, action) => {
  state.auth = action.payload?.auth;
  state.profile = action.payload?.profile;
  if (state.auth) {
    state.auth.expiredAt *= 1000; // seconds to milliseconds
  }
};
const clearAll: CaseReducer<UserStore> = (state) => {
  state.profile = state.auth = undefined;
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile,
    setTokenRefresh,
    clearAll,
  },
});
export const userReducer = persistReducer(
  {
    key: 'user',
    storage,
    version: 1,
    whitelist: ['profile'],
  },
  userSlice.reducer
);
export const userActions = userSlice.actions;
