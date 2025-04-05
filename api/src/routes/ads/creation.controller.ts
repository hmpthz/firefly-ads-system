import {
  authHandler,
  type AuthHandler,
  type AuthSessionHandler,
} from '@/middlewares/auth.middleware.js';
import { userFinder } from '../user/user.middleware.js';
import { HandledError } from '@/utils/errors.js';
import { assetTicketModel } from '@/models/asset.model.js';
import mongoose from 'mongoose';
import type { User_Populated } from '@/models/user.model.js';
import {
  type AdCreationTicket_Populated,
  adCreationTicketModel,
} from '@/models/creation.model.js';
import type {
  NewCreationFormData,
  UpdateCreationTicketFormData,
} from '@shared/creation.js';
import { createAssetItem } from './asset.controller.js';
import { adUnitModel } from '@/models/campaign.model.js';

export const getCreationList: AuthHandler<
  object,
  object,
  Partial<ReqParam<'orgId' | 'ids'>>
>[] = [
  authHandler(),
  async (req, res) => {
    const { orgId, ids } = req.query;
    if (ids) {
      const data = await adCreationTicketModel
        .find({
          _id: {
            $in: ids.split(',').map((id) => new mongoose.Types.ObjectId(id)),
          },
        })
        .populate('assets.$*');
      res.json(data.map((item) => item.toJSON()));
    } else if (orgId) {
      const data = await adCreationTicketModel
        .find({
          org: new mongoose.Types.ObjectId(orgId),
        })
        .populate('assets.$*');
      res.json(data.map((item) => item.toJSON()));
    } else {
      const data = await adCreationTicketModel
        .find()
        .populate(['org', 'assets.$*']);
      res.json(data.map((item) => item.toJSON()));
    }
  },
];

export const getCreation: AuthHandler<object, ReqParam<'id'>>[] = [
  authHandler(),
  async (req, res, next) => {
    const found = await adCreationTicketModel
      .findById(req.params.id)
      .populate<AdCreationTicket_Populated>('assets.$*');
    if (!found) {
      return next(HandledError.list['param|wrong_id|404']);
    }
    res.json(found.toJSON()).status(200);
  },
];

export const findCreationByName: AuthHandler<
  object,
  object,
  ReqParam<'name'>
>[] = [
  authHandler(),
  async (req, res, next) => {
    const found = await adCreationTicketModel.findOne({ name: req.query.name });
    if (!found) {
      return next(HandledError.list['req|wrong_name|404']);
    }
    res.json(found.toJSON()).status(200);
  },
];

export const createCreation: AuthSessionHandler<NewCreationFormData>[] = [
  authHandler(),
  userFinder(true),
  async (req, res, next) => {
    const { org } = <User_Populated>res.locals.user;
    if (!org) {
      return next(HandledError.list['req|wrong_orgid|404']);
    }

    const { unitName, assets, ...data } = req.body;
    const assetsId: Record<string, mongoose.Types.ObjectId> = {};
    for (const [key, val] of Object.entries(assets)) {
      if (typeof val == 'string') {
        const foundAsset = await assetTicketModel.findById(val);
        if (!foundAsset) {
          return next(HandledError.list['req|wrong_id|404']);
        }
        assetsId[key] = foundAsset._id;
      } else {
        const newItem = await createAssetItem(org._id, val);
        assetsId[key] = newItem._id;
      }
    }

    const newItem = new adCreationTicketModel({
      org: org._id,
      state: 'pending',
      active: false,
      assets: assetsId,
      ...data,
    });
    await newItem.save();

    if (unitName) {
      const toBound = await adUnitModel.findOne({ name: unitName });
      if (!toBound) {
        return next(HandledError.list['req|wrong_name|404']);
      }
      toBound.creations.push(newItem._id);
      await toBound.save();
    }
    res.status(201).json(newItem.toJSON());
  },
];

export const updateCreation: AuthHandler<
  Partial<NewCreationFormData>,
  ReqParam<'id'>
>[] = [
  authHandler(),
  async (req, res, next) => {
    const found = await adCreationTicketModel
      .findById(req.params.id)
      .populate<AdCreationTicket_Populated>(['assets.$*', 'org']);
    if (!found) {
      return next(HandledError.list['param|wrong_id|404']);
    }

    const { assets, ...data } = req.body;

    // 如果要激活创意投放，需要检查所有assets的状态是否为approved
    if (data.active === true) {
      // 检查创意本身状态
      if (found.state !== 'approved') {
        return next(
          new HandledError('forbidden', '创意未通过审核，不能开始投放', 403)
        );
      }

      // 检查所有物料状态
      let allAssetsApproved = true;
      for (const asset of found.assets.values()) {
        if (asset.state !== 'approved') {
          allAssetsApproved = false;
          break;
        }
      }

      if (!allAssetsApproved) {
        return next(
          new HandledError(
            'forbidden',
            '存在未通过审核的物料，不能开始投放',
            403
          )
        );
      }
    }

    for (const [key, val] of Object.entries(assets || {})) {
      const oldAsset = found.assets.get(key);
      if (val === oldAsset?.id) continue;
      // 删除旧物料
      if (oldAsset) {
        await oldAsset.deleteOne();
      }
      // 添加新物料
      if (typeof val == 'string') {
        const foundAsset = await assetTicketModel.findById(val);
        if (!foundAsset) {
          return next(HandledError.list['req|wrong_id|404']);
        }
        // @ts-expect-error
        found.assets.set(key, foundAsset._id);
      } else {
        // 创建新物料
        const newItem = await createAssetItem(found.org._id, val);
        // @ts-expect-error
        found.assets.set(key, newItem._id);
      }
    }

    if ('active' in data && found.active !== data.active) {
      // 只更新活跃状态
    }
    // 如果更新修改了active以外的字段，则停止投放
    else if (
      Object.keys(data).length > 0 &&
      'active' in data === false &&
      found.active
    ) {
      // 如果更新了其他字段且当前处于活跃状态，则停止投放
      data.active = false;
      found.state = 'pending';
    }

    found.set(data);
    await found.save();
    res.status(200).end();
  },
];

export const updateCreationState: AuthHandler<
  UpdateCreationTicketFormData,
  ReqParam<'id'>
>[] = [
  authHandler(),
  async (req, res, next) => {
    if (res.locals.userRole != 'sys.xiaoer') {
      return next(HandledError.list['auth|no_permission|403']);
    }
    const found = await adCreationTicketModel
      .findById(req.params.id)
      .populate<AdCreationTicket_Populated>('assets.$*');
    if (!found) {
      return next(HandledError.list['param|wrong_id|404']);
    }

    const { assets, ...data } = req.body;
    for (const [key, val] of Object.entries(assets)) {
      // 原地更新物料信息
      const item = found.assets.get(key);
      if (!item) continue;
      item.state = val;
      await item.save();
    }
    found.set(data);
    await found.save();
    res.status(200).end();
  },
];

export const deleteCreation: AuthHandler<object, ReqParam<'id'>>[] = [
  authHandler(['org.admin', 'sys.xiaoer']),
  async (req, res, next) => {
    const deleted = await adCreationTicketModel.findByIdAndDelete(
      req.params.id
    );
    if (!deleted) {
      return next(HandledError.list['param|wrong_id|404']);
    }
    res.status(200).end();
  },
];
