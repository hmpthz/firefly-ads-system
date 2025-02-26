import bcryptjs from 'bcryptjs';
import { authHandler } from '@/middlewares/auth.middleware.js';
import { userModel, type User } from '@/models/user.model.js';
import { HandledError } from '@/utils/errors.js';
import type { UpdateUserFormData, User_Client } from '@shared/user.js';
import mongoose from 'mongoose';
import {
  editUserAuthHandler,
  type EditUserAuthHandler,
} from './user.middleware.js';
import { organizationModel } from '@/models/org.model.js';

export const updateUser: EditUserAuthHandler<UpdateUserFormData>[] = [
  authHandler(),
  editUserAuthHandler(),
  async (req, res, next) => {
    let org: mongoose.Types.ObjectId | undefined;
    if (req.body.orgName) {
      const found = await organizationModel.findOne({ name: req.body.orgName });
      if (!found) {
        return next(HandledError.list['req|wrong_name|404']);
      }
      org = found._id;
    }
    // do not use spread syntax in case of propertis that aren't supposed to exist
    const updateData: Partial<User> = {
      email: req.body.email,
      username: req.body.username,
      role: req.body.role,
      org,
    };
    if (req.body.password) {
      updateData.password = bcryptjs.hashSync(req.body.password, 10);
    }

    const user = await userModel.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    if (!user) {
      return next(HandledError.list['param|wrong_id|404']);
    }
    const resBody: User_Client = {
      _id: req.params.id,
      id: req.params.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      orgId: user.org?.toString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
    res.json(resBody);
  },
];

export const deleteUser: EditUserAuthHandler[] = [
  authHandler(),
  editUserAuthHandler(),
  async (req, res, next) => {
    const user = await userModel.findByIdAndDelete(req.params.id, {
      new: true,
    });
    if (!user) {
      return next(HandledError.list['param|wrong_id|404']);
    }
    // TODO: also delete avatar from stroage
    res.clearCookie('refresh_token').clearCookie('has_refresh_token');
    res.status(200).end();
  },
];
