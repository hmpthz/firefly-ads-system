import { HandledError } from '@/utils/errors.js';
import {
  tokenRefreshHandler,
  type SessionHandler,
} from '@/middlewares/auth.middleware.js';
import { userModel } from '@/models/user.model.js';

export const tokenRefresh: SessionHandler[] = [
  async (req, res, next) => {
    const refreshToken: string | undefined = req.cookies['refresh_token'];
    if (!refreshToken) {
      return next(HandledError.list['session|no_refresh_token|401']);
    }
    const foundUser = await userModel.findOne({
      'session.refreshToken': refreshToken,
    });
    if (!foundUser) {
      return next(HandledError.list['session|invalid_refresh_token|401']);
    }
    if (Date.now() >= foundUser.session!.expiredAt) {
      return next(HandledError.list['session|expired|403']);
    }
    res.locals.user = foundUser;
    next();
  },
  tokenRefreshHandler(false),
];
