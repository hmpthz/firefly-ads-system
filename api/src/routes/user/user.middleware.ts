import { type AuthSessionHandler } from '@/middlewares/auth.middleware.js';
import { userModel } from '@/models/user.model.js';
import { HandledError } from '@/utils/errors.js';

type IdParam = ReqParam<'id'>;
export type EditUserAuthHandler<ReqBody = object> = AuthSessionHandler<
  ReqBody,
  IdParam
>;

export const editUserAuthHandler: () => EditUserAuthHandler =
  () => async (req, res, next) => {
    const reqUserId = req.params.id;
    const initiatorUserId = res.locals.userId;
    // 自己可以编辑自己
    if (reqUserId == initiatorUserId) {
      return next();
    }
    // 进一步鉴权，发起人是相同机构的管理员才有权限
    const reqUser = await userModel.findById(reqUserId);
    const initiator = await userModel.findById(initiatorUserId);
    if (!reqUser) {
      return next(HandledError.list['param|wrong_id|404']);
    }
    if (!initiator) {
      return next(HandledError.list['auth|wrong_userid|404']);
    }
    if (
      !reqUser.org ||
      reqUser.org !== initiator.org ||
      initiator.role != 'org.admin'
    ) {
      return next(HandledError.list['auth|no_permission|403']);
    }
    return next();
  };

export const userFinder: (populateOrg?: boolean) => AuthSessionHandler =
  (populateOrg = false) =>
  async (_req, res, next) => {
    const { userId } = res.locals;
    const query = userModel.findById(userId);
    if (populateOrg) {
      query.populate('org');
    }
    const user = await query;
    if (!user) {
      return next(HandledError.list['auth|wrong_userid|404']);
    }
    res.locals.user = user;
    return next();
  };
