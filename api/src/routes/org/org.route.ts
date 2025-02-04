import { AsyncHandlingRouter } from '@/middlewares/async-router.js';
import { createOrg } from './org.controller.js';

export const orgRouter = AsyncHandlingRouter();

orgRouter.post('/create', ...createOrg);
