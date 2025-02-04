import {
  authHandler,
  tokenRefreshHandler,
  type AuthSessionHandler,
} from '@/middlewares/auth.middleware.js';
import { organizationModel } from '@/models/org.model.js';
import { userModel } from '@/models/user.model.js';
import { HandledError } from '@/utils/errors.js';
import type { CreateOrgFormData } from '@shared/org.js';

export const createOrg: AuthSessionHandler<CreateOrgFormData>[] = [
  authHandler(),
  async (req, res, next) => {
    // 首先创建新机构
    const newOrg = new organizationModel({
      name: req.body.name,
      description: req.body.description,
      address: req.body.address,
      contactPerson: req.body.contactPerson,
      contactEmail: req.body.contactEmail,
    });
    await newOrg.save();
    // 更新用户信息
    const user = await userModel.findByIdAndUpdate(
      res.locals.userId,
      { $set: { role: req.body.role, org: newOrg._id } },
      { new: true }
    );
    if (!user) {
      return next(HandledError.list['auth|wrong_userid|404']);
    }
    res.locals.user = user;
    return next();
  },
  tokenRefreshHandler(false),
];
