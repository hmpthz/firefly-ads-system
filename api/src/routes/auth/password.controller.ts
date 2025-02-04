import { userModel } from '@/models/user.model.js';
import bcryptjs from 'bcryptjs';
import { HandledError } from '@/utils/errors.js';
import {
  authHandler,
  sessionHandler,
  tokenRefreshHandler,
  type AuthHandler,
  type SessionHandler,
} from '@/middlewares/auth.middleware.js';
import type { SignInFormData, SignUpFormData } from '@shared/user.js';
import type mongoose from 'mongoose';
import { organizationModel } from '@/models/org.model.js';

export const signUp: SessionHandler<SignUpFormData>[] = [
  async (req, res, next) => {
    const { email, username, password, role, orgName } = req.body;
    const hashedPassword = bcryptjs.hashSync(password, 10);
    let org: mongoose.Types.ObjectId | undefined;
    if (orgName) {
      const found = await organizationModel.findOne({ name: orgName });
      if (!found) {
        return next(HandledError.list['org|no_name|404']);
      }
      org = found._id;
    }
    const newUser = new userModel({
      email,
      username,
      password: hashedPassword,
      avatar: '/blank-profile.png',
      role,
      org,
    });
    await newUser.save();
    res.locals.user = newUser;
    return next();
  },
  sessionHandler(),
  tokenRefreshHandler(true),
];

export const signIn: SessionHandler<SignInFormData>[] = [
  async (req, res, next) => {
    const { email, password } = req.body;
    const foundUser = await userModel.findOne({ email });
    if (!foundUser) {
      return next(HandledError.list['signin|no_email|404']);
    }
    if (!bcryptjs.compareSync(password, foundUser.password)) {
      return next(HandledError.list['signin|wrong_credential|401']);
    }
    res.locals.user = foundUser;
    return next();
  },
  sessionHandler(),
  tokenRefreshHandler(true),
];

export const signOut: AuthHandler[] = [
  authHandler(),
  async (_req, res, next) => {
    const user = await userModel.findByIdAndUpdate(
      res.locals.userId,
      { $unset: { session: 1 } },
      { new: true }
    );
    if (!user) {
      return next(HandledError.list['auth|wrong_userid|404']);
    }
    res.clearCookie('refresh_token').clearCookie('has_refresh_token');
    res.status(200).end();
  },
];
