import {
  authHandler,
  type AuthHandler,
  type AuthSessionHandler,
} from '@/middlewares/auth.middleware.js';
import { userFinder } from '../user/user.middleware.js';
import { HandledError } from '@/utils/errors.js';
import mongoose from 'mongoose';
import type { User_Populated } from '@/models/user.model.js';
import { adCampaignModel, adUnitModel } from '@/models/campaign.model.js';
import type {
  NewCampaignFormData,
  NewUnitFormData,
  UpdateCampaignFormData,
  UpdateUnitFormData,
} from '@shared/campaign.js';

export const getCampaignList: AuthHandler<object, object, ReqParam<'orgId'>>[] =
  [
    authHandler(),
    async (req, res) => {
      const { orgId } = req.query;
      const data = await adCampaignModel
        .find({
          org: new mongoose.Types.ObjectId(orgId),
        })
        .populate('units');
      res.json(data.map((item) => item.toJSON()));
    },
  ];

export const getCampaign: AuthHandler<object, ReqParam<'id'>>[] = [
  authHandler(),
  async (req, res, next) => {
    const found = await adCampaignModel
      .findById(req.params.id)
      .populate('units');
    if (!found) {
      return next(HandledError.list['param|wrong_id|404']);
    }
    res.json(found.toJSON()).status(200);
  },
];

export const getUnit: AuthHandler<object, ReqParam<'id'>>[] = [
  authHandler(),
  async (req, res, next) => {
    const found = await adUnitModel
      .findById(req.params.id)
      .populate('creations');
    if (!found) {
      return next(HandledError.list['param|wrong_id|404']);
    }
    res.json(found.toJSON()).status(200);
  },
];

async function createUnitItem(
  org: mongoose.Types.ObjectId,
  data: NewUnitFormData
) {
  const { creations, ...rest } = data;
  const newItem = new adUnitModel({
    org,
    creations: creations.map((id) => new mongoose.Types.ObjectId(id)),
    ...rest,
  });
  await newItem.save();
  return newItem;
}

export const createCampaign: AuthSessionHandler<NewCampaignFormData>[] = [
  authHandler(),
  userFinder(true),
  async (req, res, next) => {
    const { org } = <User_Populated>res.locals.user;
    if (!org) {
      return next(HandledError.list['req|wrong_orgid|404']);
    }

    const { units, ...data } = req.body;
    const unitsId: mongoose.Types.ObjectId[] = [];
    for (const data of units) {
      const newItem = await createUnitItem(org._id, data);
      unitsId.push(newItem._id);
    }

    const newItem = new adCampaignModel({
      org: org._id,
      units: unitsId,
      ...data,
    });
    await newItem.save();
    res.status(201).send(newItem.id);
  },
];

export const updateCampaign: AuthHandler<
  UpdateCampaignFormData,
  ReqParam<'id'>
>[] = [
  authHandler(),
  async (req, res, next) => {
    const found = await adCampaignModel.findById(req.params.id);
    if (!found) {
      return next(HandledError.list['param|wrong_id|404']);
    }

    const { units, ...data } = req.body;
    for (const unitUpdate of units) {
      if (unitUpdate.op == 'new') {
        const newItem = await createUnitItem(found.org, unitUpdate.data);
        found.units.push(newItem._id);
      } else {
        await adUnitModel.findByIdAndDelete(unitUpdate.id);
        found.units.pull(unitUpdate.id);
      }
    }
    found.set(data);
    await found.save();
    res.status(200).end();
  },
];

export const updateUnit: AuthHandler<UpdateUnitFormData, ReqParam<'id'>>[] = [
  authHandler(),
  async (req, res, next) => {
    const found = await adUnitModel.findById(req.params.id);
    if (!found) {
      return next(HandledError.list['param|wrong_id|404']);
    }

    const { creations, ...data } = req.body;
    for (const { op, id } of creations) {
      if (op == 'new') {
        found.creations.push(new mongoose.Types.ObjectId(id));
      } else {
        found.creations.pull(id);
      }
    }
    found.set(data);
    await found.save();
    res.status(200).end();
  },
];

export const deleteCampaign: AuthHandler<object, ReqParam<'id'>>[] = [
  authHandler(['org.admin', 'sys.xiaoer']),
  async (req, res, next) => {
    const found = await adCampaignModel.findById(req.params.id);
    if (!found) {
      return next(HandledError.list['param|wrong_id|404']);
    }
    for (const unitId of found.units) {
      await adUnitModel.findByIdAndDelete(unitId);
    }
    await found.deleteOne();
    res.status(200).end();
  },
];
