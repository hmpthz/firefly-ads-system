import {
  authHandler,
  type AuthHandler,
  type AuthSessionHandler,
} from '@/middlewares/auth.middleware.js';
import type { Attachment, UpdateTicketFormData } from '@shared/asset.js';
import { userFinder } from '../user/user.middleware.js';
import { HandledError } from '@/utils/errors.js';
import { credentialTicketModel } from '@/models/org.model.js';
import type { User_Populated } from '@/models/user.model.js';
import mongoose from 'mongoose';

export const getCredentialList: AuthHandler<
  object,
  object,
  Partial<ReqParam<'orgId'>>
>[] = [
  authHandler(),
  async (req, res) => {
    const { orgId } = req.query;
    if (orgId) {
      const data = await credentialTicketModel.find({
        org: new mongoose.Types.ObjectId(orgId),
      });
      res.json(data.map((item) => item.toJSON()));
    } else {
      const data = await credentialTicketModel.find().populate('org');
      res.json(data.map((item) => item.toJSON()));
    }
  },
];

export const createCredential: AuthSessionHandler<Attachment[]>[] = [
  authHandler(),
  userFinder(true),
  async (req, res, next) => {
    const { org } = <User_Populated>res.locals.user;
    if (!org) {
      return next(HandledError.list['ticket|no_orgid|404']);
    }
    const newItem = new credentialTicketModel({
      org: org._id,
      state: 'pending',
      attachments: req.body,
    });
    await newItem.save();
    org.credential = newItem._id;
    org.credentialTickets.push(newItem._id);
    await org.save();
    res.status(201).end();
  },
];

export const getCredential: AuthHandler<object, ReqParam<'id'>>[] = [
  authHandler(),
  async (req, res) => {},
];

export const updateCredential: AuthHandler<
  UpdateTicketFormData,
  ReqParam<'id'>
>[] = [
  authHandler(),
  async (req, res, next) => {
    const { state } = req.body;
    const updated = await credentialTicketModel.findByIdAndUpdate(
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
