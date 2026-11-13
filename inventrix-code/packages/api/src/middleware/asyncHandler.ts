import { Request, Response, NextFunction, RequestHandler } from 'express';

// Express 4 does not forward a rejected promise from a route handler to the error middleware.
export const asyncHandler = <Req extends Request = Request>(
  handler: (req: Req, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler => {
  return (req, res, next) => {
    handler(req as Req, res, next).catch(next);
  };
};
