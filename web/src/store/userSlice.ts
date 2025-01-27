import {
  createSlice,
  type CaseReducer,
  type PayloadAction,
} from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatar: string;
}
export interface UserAuth {
  accessToken: string;
  expiredAt: number;
  role: string;
}
export interface TokenRefresh_Response {
  auth: UserAuth;
  profile: UserProfile;
}
interface UserStore extends Partial<TokenRefresh_Response> {}
const initialState: UserStore = {};

const setProfile: CaseReducer<UserStore, PayloadAction<UserProfile>> = (
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
export const userReducers = persistReducer(
  {
    key: 'user',
    storage,
    version: 1,
    whitelist: ['profile'],
  },
  userSlice.reducer
);
export const userActions = userSlice.actions;
