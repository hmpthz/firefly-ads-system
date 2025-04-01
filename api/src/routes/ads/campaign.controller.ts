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
import type { NewCampaignFormData } from '@shared/campaign.js';

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

export const createCampaign: AuthSessionHandler<NewCampaignFormData>[] = [
  authHandler(),
  userFinder(true),
  async (req, res, next) => {
    const { org } = <User_Populated>res.locals.user;
    if (!org) {
      return next(HandledError.list['req|wrong_orgid|404']);
    }

    const { units, ...data } = req.body;

    const newItem = new adCampaignModel({
      org: org._id,
      units: units.map((id) => new mongoose.Types.ObjectId(id)),
      ...data,
    });
    await newItem.save();
    res.status(201).send(newItem.id);
  },
];

export const updateCampaign: AuthHandler<
  Partial<NewCampaignFormData>,
  ReqParam<'id'>
>[] = [
  authHandler(),
  async (req, res, next) => {
    const found = await adCampaignModel.findById(req.params.id);
    if (!found) {
      return next(HandledError.list['param|wrong_id|404']);
    }

    const { units: newUnitIds, ...data } = req.body;
    const updateData: Partial<Omit<NewCampaignFormData, 'units'>> & {
      units?: mongoose.Types.ObjectId[];
    } = { ...data };

    if (newUnitIds) {
      // 找出需要删除的单元（在原列表中但不在新列表中的单元）
      const oldUnitIds = found.units.map((id) => id.toString());
      const unitsToDelete = oldUnitIds.filter((id) => !newUnitIds.includes(id));
      // 删除不再使用的单元
      await Promise.all(
        unitsToDelete.map((id) => adUnitModel.findByIdAndDelete(id))
      );
      updateData.units = newUnitIds.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
    }

    if (found.active === updateData.active) {
      // 没有更新状态，而是修改了其他字段
      // 停止投放
      updateData.active = false;
    }
    found.set(updateData);
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
