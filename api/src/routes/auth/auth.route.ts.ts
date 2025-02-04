import { AsyncHandlingRouter } from '@/middlewares/async-router.js';
import { signIn, signOut, signUp } from './password.controller.js';
import { tokenRefresh } from './token.controller.js';

export const authRouter = AsyncHandlingRouter();

authRouter.get('/token/refresh', ...tokenRefresh);

authRouter.post('/signup', ...signUp);
authRouter.post('/signin', ...signIn);
authRouter.post('/signout', ...signOut);
