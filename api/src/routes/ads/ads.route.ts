import { AsyncHandlingRouter } from '@/middlewares/async-router.js';
import {
  createAsset,
  deleteAsset,
  findAssetByName,
  getAssetList,
  updateAsset,
} from './asset.controller.js';
import {
  createCreation,
  deleteCreation,
  getCreation,
  findCreationByName,
  getCreationList,
  updateCreation,
  updateCreationState,
} from './creation.controller.js';
import {
  createCampaign,
  deleteCampaign,
  getCampaign,
  getCampaignList,
  updateCampaign,
} from './campaign.controller.js';
import {
  createUnit,
  deleteUnit,
  findUnitByName,
  getUnit,
  getUnitList,
  updateUnit,
} from './unit.controller.js';

export const adsRouter = AsyncHandlingRouter();
const assetRouter = AsyncHandlingRouter();
const creationRouter = AsyncHandlingRouter();
const unitRouter = AsyncHandlingRouter();
const campaignRouter = AsyncHandlingRouter();

adsRouter.use('/asset', assetRouter);
adsRouter.use('/creation', creationRouter);
adsRouter.use('/unit', unitRouter);
adsRouter.use('/campaign', campaignRouter);

assetRouter.post('/create', ...createAsset);
assetRouter.get('/list', ...getAssetList);
assetRouter.get('/find', ...findAssetByName);
assetRouter.patch('/:id', ...updateAsset);
assetRouter.delete('/:id', ...deleteAsset);

creationRouter.post('/create', ...createCreation);
creationRouter.get('/list', ...getCreationList);
creationRouter.get('/find', ...findCreationByName);
creationRouter.get('/:id', ...getCreation);
creationRouter.patch('/:id', ...updateCreation);
creationRouter.patch('/:id/state', ...updateCreationState);
creationRouter.delete('/:id', ...deleteCreation);

unitRouter.post('/create', ...createUnit);
unitRouter.get('/list', ...getUnitList);
unitRouter.get('/find', ...findUnitByName);
unitRouter.get('/:id', ...getUnit);
unitRouter.patch('/:id', ...updateUnit);
unitRouter.delete('/:id', ...deleteUnit);

campaignRouter.post('/create', ...createCampaign);
campaignRouter.get('/list', ...getCampaignList);
campaignRouter.get('/:id', ...getCampaign);
campaignRouter.patch('/:id', ...updateCampaign);
campaignRouter.delete('/:id', ...deleteCampaign);
