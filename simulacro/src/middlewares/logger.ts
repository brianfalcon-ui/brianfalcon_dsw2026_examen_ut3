import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
export function logger(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;

    if (env.LOG === 'ON') {
      console.log(
        JSON.stringify({
          requestId: req.requestId,
          method: req.method,
          path: req.path,
          status: res.statusCode,
          durationMs: Math.round(durationMs * 100) / 100,
        }),
      );
    }
  });
  next();
}
