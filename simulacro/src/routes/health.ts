import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/live', (_req, res) => {
  res.status(200).json({ status: 'live' });
});

healthRouter.get('/ready', (_req, res) => {
  res.status(200).json({ status: 'ready' });
});
