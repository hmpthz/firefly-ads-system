import { AsyncHandlingRouter } from '@/middlewares/async-router.js';
import {
  createAsset,
  getAsset,
  getAssetList,
  updateAsset,
} from './asset.controller.js';

export const adsRouter = AsyncHandlingRouter();
const assetRouter = AsyncHandlingRouter();

adsRouter.use('/asset', assetRouter);

assetRouter.post('/create', ...createAsset);
assetRouter.get('/list', ...getAssetList);
assetRouter.get('/:id/item', ...getAsset);
assetRouter.post('/:id/update', ...updateAsset);
