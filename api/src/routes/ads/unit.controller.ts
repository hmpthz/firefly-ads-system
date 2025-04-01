import {
  authHandler,
  type AuthHandler,
  type AuthSessionHandler,
} from '@/middlewares/auth.middleware.js';
import { userFinder } from '../user/user.middleware.js';
import { HandledError } from '@/utils/errors.js';
import mongoose from 'mongoose';
import { adCampaignModel, adUnitModel } from '@/models/campaign.model.js';
import type { NewUnitFormData } from '@shared/campaign.js';
import { adCreationTicketModel } from '@/models/creation.model.js';
import type { User_Populated } from '@/models/user.model.js';

// 获取广告单元列表
export const getUnitList: AuthHandler<object, object, ReqParam<'orgId'>>[] = [
  authHandler(),
  async (req, res) => {
    const { orgId } = req.query;
    const data = await adUnitModel
      .find({
        org: new mongoose.Types.ObjectId(orgId),
      })
      .populate('creations');
    res.json(data.map((item) => item.toJSON()));
  },
];

// 根据名称查找广告单元
export const findUnitByName: AuthHandler<object, object, ReqParam<'name'>>[] = [
  authHandler(),
  async (req, res, next) => {
    const found = await adUnitModel.findOne({ name: req.query.name });
    if (!found) {
      return next(HandledError.list['req|wrong_name|404']);
    }
    res.json(found.toJSON()).status(200);
  },
];

// 获取单个广告单元
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

// 创建广告单元
export const createUnit: AuthSessionHandler<NewUnitFormData>[] = [
  authHandler(),
  userFinder(true),
  async (req, res, next) => {
    const { org } = <User_Populated>res.locals.user;
    if (!org) {
      return next(HandledError.list['req|wrong_orgid|404']);
    }

    const { campaignName, creations, ...data } = req.body;

    const newItem = new adUnitModel({
      org: org._id,
      creations: creations.map((id) => new mongoose.Types.ObjectId(id)),
      ...data,
    });
    await newItem.save();

    if (campaignName) {
      const toBound = await adCampaignModel.findOne({ name: campaignName });
      if (!toBound) {
        return next(HandledError.list['req|wrong_name|404']);
      }
      toBound.units.push(newItem._id);
      await toBound.save();
    }
    res.status(201).send(newItem.id);
  },
];

// 更新广告单元
export const updateUnit: AuthHandler<
  Partial<NewUnitFormData>,
  ReqParam<'id'>
>[] = [
  authHandler(),
  async (req, res, next) => {
    const found = await adUnitModel.findById(req.params.id);
    if (!found) {
      return next(HandledError.list['param|wrong_id|404']);
    }

    const { creations: newCreationIds, ...data } = req.body;
    const updateData: Partial<Omit<NewUnitFormData, 'creations'>> & {
      creations?: mongoose.Types.ObjectId[];
    } = { ...data };

    if (newCreationIds) {
      // 找出需要删除的创意（在原列表中但不在新列表中的创意）
      const oldCreationIds = found.creations.map((id) => id.toString());
      const creationsToDelete = oldCreationIds.filter(
        (id) => !newCreationIds.includes(id)
      );
      // 删除不再使用的创意
      await Promise.all(
        creationsToDelete.map((id) =>
          adCreationTicketModel.findByIdAndDelete(id)
        )
      );
      updateData.creations = newCreationIds.map(
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

// 删除广告单元
export const deleteUnit: AuthHandler<object, ReqParam<'id'>>[] = [
  authHandler(['org.admin', 'sys.xiaoer']),
  async (req, res, next) => {
    const found = await adUnitModel.findById(req.params.id);
    if (!found) {
      return next(HandledError.list['param|wrong_id|404']);
    }
    // 删除关联的创意
    for (const creationId of found.creations) {
      await adCreationTicketModel.findByIdAndDelete(creationId);
    }
    await found.deleteOne();
    res.status(200).end();
  },
];
