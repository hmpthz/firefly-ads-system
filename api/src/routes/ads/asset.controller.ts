import {
  authHandler,
  type AuthHandler,
  type AuthSessionHandler,
} from '@/middlewares/auth.middleware.js';
import type { Attachment, UpdateTicketFormData } from '@shared/asset.js';
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

export const createAsset: AuthSessionHandler<Attachment>[] = [
  authHandler(),
  userFinder(true),
  async (req, res, next) => {
    const { org } = <User_Populated>res.locals.user;
    if (!org) {
      return next(HandledError.list['ticket|no_orgid|404']);
    }
    const newItem = new assetTicketModel({
      org: org._id,
      state: 'pending',
      ...req.body,
    });
    await newItem.save();
    org.assetTickets.push(newItem._id);
    await org.save();
    res.status(201).end();
  },
];

export const getAsset: AuthHandler<object, ReqParam<'id'>>[] = [
  authHandler(),
  async (req, res, next) => {},
];

export const updateAsset: AuthHandler<UpdateTicketFormData, ReqParam<'id'>>[] =
  [
    authHandler(),
    async (req, res, next) => {
      const { state } = req.body;
      const updated = await assetTicketModel.findByIdAndUpdate(
        req.params.id,
        { $set: { state } },
        { new: true }
      );
      if (!updated) {
        return HandledError.list['ticket|no_id|404'];
      }
      res.status(200).end();
    },
  ];
