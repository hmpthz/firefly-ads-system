// https://stackoverflow.com/questions/51391080/handling-errors-in-express-async-middleware
import { Router, type RequestHandler } from 'express';

const asyncHandler: (fn: RequestHandler) => RequestHandler = (fn) => {
  console.assert(fn.length < 4);
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
};

const methods = [
  'get',
  'post',
  'patch',
  'put',
  'delete',
  'options',
  'head',
] as const;
type Methods = (typeof methods)[number];

export function AsyncHandlingRouter() {
  const router = Router();
  // eslint-disable-next-line
  type AnyRouteMatcher = (path: any, ...handlers: any[]) => Router;
  const matchers = router as Record<Methods, AnyRouteMatcher>;
  for (const method of methods) {
    const matcher = matchers[method];
    if (!matcher) continue;
    matchers[method] = (path, ...handlers) => {
      handlers = handlers.map((fn) => asyncHandler(fn));
      return matcher.call(router, path, ...handlers);
    };
  }
  return router;
}
