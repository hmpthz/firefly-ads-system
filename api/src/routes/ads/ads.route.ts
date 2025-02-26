import { AsyncHandlingRouter } from '@/middlewares/async-router.js';
import {
  createAsset,
  deleteAsset,
  getAssetByName,
  getAssetList,
  updateAsset,
} from './asset.controller.js';
import {
  createCreation,
  deleteCreation,
  getCreation,
  getCreationByName,
  getCreationList,
  updateCreation,
  updateCreationState,
} from './creation.controller.js';
import {
  createCampaign,
  deleteCampaign,
  getCampaign,
  getCampaignList,
  getUnit,
  updateCampaign,
  updateUnit,
} from './campaign.controller.js';

export const adsRouter = AsyncHandlingRouter();
const assetRouter = AsyncHandlingRouter();
const creationRouter = AsyncHandlingRouter();
const campaignRouter = AsyncHandlingRouter();

adsRouter.use('/asset', assetRouter);
adsRouter.use('/creation', creationRouter);
adsRouter.use('/campaign', campaignRouter);

assetRouter.post('/create', ...createAsset);
assetRouter.get('/list', ...getAssetList);
assetRouter.get('/find', ...getAssetByName);
assetRouter.patch('/:id', ...updateAsset);
assetRouter.delete('/:id', ...deleteAsset);

creationRouter.post('/create', ...createCreation);
creationRouter.get('/list', ...getCreationList);
creationRouter.get('/find', ...getCreationByName);
creationRouter.get('/:id', ...getCreation);
creationRouter.patch('/:id', ...updateCreation);
creationRouter.patch('/:id/state', ...updateCreationState);
creationRouter.delete('/:id', ...deleteCreation);

campaignRouter.post('/create', ...createCampaign);
campaignRouter.get('/list', ...getCampaignList);
campaignRouter.get('/:id', ...getCampaign);
campaignRouter.get('/unit/:id', ...getUnit);
campaignRouter.patch('/:id', ...updateCampaign);
campaignRouter.patch('/unit/:id', ...updateUnit);
campaignRouter.delete('/:id', ...deleteCampaign);
