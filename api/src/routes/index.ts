import { AsyncHandlingRouter } from '@/middlewares/async-router.js';
import { userRouter } from './user/user.route.ts.js';
import { authRouter } from './auth/auth.route.ts.js';
import { orgRouter } from './org/org.route.js';

export const apiRouter = AsyncHandlingRouter();

apiRouter.use('/auth', authRouter);
apiRouter.use('/user', userRouter);
apiRouter.use('/org', orgRouter);
