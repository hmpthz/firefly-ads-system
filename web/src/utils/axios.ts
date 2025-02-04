/**
 * https://github.com/axios/axios/issues/1663
 * Request interceptors are in reverse order;
 * Response interceptors in normal order;
 *
 * https://github.com/axios/axios/issues/2509
 * interceptors work like then(onFulfilled, onRejected)
 * So only the second interceptor catch the error from first one
 */
import axios from 'axios';
import { store } from '@/store';
import { getErrorMessage, isReadableError } from './error';
import type { TokenRefresh_Response } from '@shared/user';

export const publicApi = axios.create();
export const privateApi = axios.create({
  // only affects cross site requests
  // not needed because this app only has same origin
  withCredentials: true,
});

publicApi.interceptors.response.use(
  (res) => res,
  (err) => {
    throw getErrorMessage(err);
  }
);

const tokenRefresher = new (class TokenRefresher {
  protected _authenticating?: Promise<string>;

  async getAccessToken() {
    const auth = store.getState().user.auth;
    if (auth && Date.now() < auth.expiredAt) {
      return auth.accessToken;
    }
    if (!this._authenticating) {
      this._authenticating = this.refresh();
    }
    return this._authenticating.finally(() => {
      this._authenticating = undefined; // cannot be put inside refresh() because it's not yet assigned
    });
  }

  /** throw `'refresh_token not found'` if cookie does not exist */
  async refresh() {
    const { dispatch, userActions } = store;

    try {
      if (this.checkCookieValue('has_refresh_token') == undefined) {
        this.resetUserStore();
        throw 'refresh_token not found';
      }
      const res = await publicApi.get<TokenRefresh_Response>(
        '/api/auth/token/refresh',
        { withCredentials: true }
      );
      dispatch(userActions.setTokenRefresh(res.data));
      console.log('Token refreshed.');
      return res.data.auth.accessToken;
    } catch (err) {
      // failed to obtain new token, so signed-in state cannot be kept
      this.resetUserStore();
      throw err;
    }
  }

  resetUserStore() {
    const { dispatch, userActions } = store;
    dispatch(userActions.setTokenRefresh(undefined));
  }

  checkCookieValue(name: string) {
    return document.cookie
      .split('; ')
      .find((item) => item.startsWith(name + '='))
      ?.split('=')[1];
  }
})();

export function tokenFirstRefresh() {
  return tokenRefresher.getAccessToken().catch((errMsg) => {
    if (errMsg == 'refresh_token not found') console.log(errMsg);
    else console.error(errMsg);
    return null;
  });
}

privateApi.interceptors.request.use(async (req) => {
  const token = await tokenRefresher.getAccessToken();
  req.headers['Authorization'] = `Bearer ${token}`;
  return req;
});

privateApi.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (!isReadableError(err)) {
      throw err;
    }

    const errMsg = err.response.data.error;
    if (!errMsg.includes('access_token expired') || !err.config) {
      // other errors that can't be handled
      throw errMsg;
    }

    // even if access token has passed request interceptor check, it's still expired
    const token = await tokenRefresher.getAccessToken();
    // retry
    const originalRequest = err.config;
    originalRequest.headers['Authorization'] = `Bearer ${token}`;
    return axios.request(originalRequest);
  }
);

// final middleware to process error to a string
privateApi.interceptors.response.use(
  (res) => res,
  (err) => {
    throw getErrorMessage(err);
  }
);
