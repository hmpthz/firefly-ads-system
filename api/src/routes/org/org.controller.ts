import {
  authHandler,
  type AuthHandler,
} from '@/middlewares/auth.middleware.js';
import {
  type Organization_Populated,
  organizationModel,
} from '@/models/org.model.js';
import { userModel } from '@/models/user.model.js';
import { HandledError } from '@/utils/errors.js';
import type { CreateOrgFormData } from '@shared/org.js';
import type { User_Client } from '@shared/user.js';

export const createOrg: AuthHandler<CreateOrgFormData>[] = [
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
    const resBody: User_Client = {
      id: user.id,
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

export const getOrg: AuthHandler<object, ReqParam<'id'>>[] = [
  authHandler(),
  async (req, res, next) => {
    const found = await organizationModel
      .findById(req.params.id)
      .populate<Organization_Populated>('credential');
    if (!found) {
      return next(HandledError.list['org|no_id|404']);
    }
    res.status(200).json(found.toJSON());
  },
];

export const getOrgList: AuthHandler[] = [
  authHandler(['sys.xiaoer']),
  async (_req, res) => {
    const data = await organizationModel.find().populate('credential');
    res.json(data.map((item) => item.toJSON()));
  },
];
