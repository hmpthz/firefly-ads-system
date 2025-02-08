import { AsyncHandlingRouter } from '@/middlewares/async-router.js';
import { createOrg, getOrg, getOrgList } from './org.controller.js';
import {
  createCredential,
  getCredential,
  getCredentialList,
  updateCredential,
} from './credential.controller.js';

export const orgRouter = AsyncHandlingRouter();
const credentialRouter = AsyncHandlingRouter();

orgRouter.post('/create', ...createOrg);
orgRouter.get('/list', ...getOrgList);
orgRouter.use('/credential', credentialRouter);
orgRouter.get('/:id/item', ...getOrg);

credentialRouter.post('/create', ...createCredential);
credentialRouter.get('/list', ...getCredentialList);
credentialRouter.get('/:id/item', ...getCredential);
credentialRouter.post('/:id/update', ...updateCredential);
