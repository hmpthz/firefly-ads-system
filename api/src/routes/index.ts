import { AsyncHandlingRouter } from '@/middlewares/async-router.js';
import { userRouter } from './user/user.route.ts.js';
import { authRouter } from './auth/auth.route.ts.js';
import { orgRouter } from './org/org.route.js';
import { adsRouter } from './ads/ads.route.js';
import { adCreationTicketModel } from '@/models/creation.model.js';

export const apiRouter = AsyncHandlingRouter();

apiRouter.use('/auth', authRouter);
apiRouter.use('/user', userRouter);
apiRouter.use('/org', orgRouter);
apiRouter.use('/ads', adsRouter);

apiRouter.get('/test', async (req, res) => {
  await adCreationTicketModel.deleteMany();
  res.status(200).end();
});
