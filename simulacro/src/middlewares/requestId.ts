import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

declare global {
  // La ampliación de tipos de Express requiere usar su namespace.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

export function requestId(req: Request, res: Response, next: NextFunction): void {
  req.requestId = randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  next();
}