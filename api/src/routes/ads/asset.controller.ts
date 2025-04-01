import {
  authHandler,
  type AuthHandler,
  type AuthSessionHandler,
} from '@/middlewares/auth.middleware.js';
import type { Attachment, UpdateAssetFormData } from '@shared/asset.js';
import { userFinder } from '../user/user.middleware.js';
import { HandledError } from '@/utils/errors.js';
import { assetTicketModel } from '@/models/asset.model.js';
import mongoose from 'mongoose';
import type { User_Populated } from '@/models/user.model.js';

export const getAssetList: AuthHandler<
  object,
  object,
  Partial<ReqParam<'orgId'>>
>[] = [
  authHandler(),
  async (req, res) => {
    const { orgId } = req.query;
    if (orgId) {
      const data = await assetTicketModel.find({
        org: new mongoose.Types.ObjectId(orgId),
      });
      res.json(data.map((item) => item.toJSON()));
    } else {
      const data = await assetTicketModel.find().populate('org');
      res.json(data.map((item) => item.toJSON()));
    }
  },
];

export const findAssetByName: AuthHandler<object, object, ReqParam<'name'>>[] =
  [
    authHandler(),
    async (req, res, next) => {
      const found = await assetTicketModel.findOne({ name: req.query.name });
      if (!found) {
        return next(HandledError.list['req|wrong_name|404']);
      }
      res.json(found.toJSON()).status(200);
    },
  ];

export async function createAssetItem(
  org: mongoose.Types.ObjectId,
  data: Attachment
) {
  const newItem = new assetTicketModel({
    org,
    state: 'pending',
    ...data,
  });
  await newItem.save();
  return newItem;
}

export const createAsset: AuthSessionHandler<Attachment>[] = [
  authHandler(),
  userFinder(true),
  async (req, res, next) => {
    const { org } = <User_Populated>res.locals.user;
    if (!org) {
      return next(HandledError.list['req|wrong_orgid|404']);
    }
    const newItem = await createAssetItem(org._id, req.body);
    res.status(201).json(newItem.toJSON());
  },
];

export const updateAsset: AuthHandler<UpdateAssetFormData, ReqParam<'id'>>[] = [
  authHandler(),
  async (req, res, next) => {
    if (req.body.state && res.locals.userRole != 'sys.xiaoer') {
      return next(HandledError.list['auth|no_permission|403']);
    }
    const updated = await assetTicketModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updated) {
      return next(HandledError.list['param|wrong_id|404']);
    }
    res.status(200).end();
  },
];

export const deleteAsset: AuthHandler<object, ReqParam<'id'>>[] = [
  authHandler(['org.admin', 'sys.xiaoer']),
  async (req, res, next) => {
    const deleted = await assetTicketModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return next(HandledError.list['param|wrong_id|404']);
    }
    res.status(200).end();
  },
];
