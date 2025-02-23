import { AsyncHandlingRouter } from '@/middlewares/async-router.js';
import { createOrg, getOrg, getOrgList } from './org.controller.js';
import {
  createCredential,
  deleteCredential,
  getCredential,
  getCredentialList,
  updateCredential,
} from './credential.controller.js';

export const orgRouter = AsyncHandlingRouter();
const credentialRouter = AsyncHandlingRouter();

orgRouter.post('/create', ...createOrg);
orgRouter.get('/list', ...getOrgList);
orgRouter.use('/credential', credentialRouter);
orgRouter.get('/:id', ...getOrg);

credentialRouter.post('/create', ...createCredential);
credentialRouter.get('/list', ...getCredentialList);
credentialRouter.get('/:id', ...getCredential);
credentialRouter.patch('/:id', ...updateCredential);
credentialRouter.delete('/:id', ...deleteCredential);
