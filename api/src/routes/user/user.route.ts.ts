import { AsyncHandlingRouter } from '@/middlewares/async-router.js';
import { deleteUser, updateUser } from './user.controller.js';

export const userRouter = AsyncHandlingRouter();

userRouter.patch('/action/:id', ...updateUser);
userRouter.delete('/action/:id', ...deleteUser);
