import type { Request, Response } from 'express';
import * as noticesService from '../services/noticesService.js';

import { AppError } from '../errors/AppError.js';

// GET /api/v1/notices?page=1&limit=2
export function list(req: Request, res: Response): void {
  // req.query SIEMPRE llega como texto: "2", no 2. Hay que convertirlo.
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 2);

  if (!Number.isInteger(page)|| !Number.isInteger(limit) || page < 1 || limit < 1 ) {
  throw new AppError(400, 'page and limit must be positive integers', 'INVALID_PAGINATION');
}
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const { data, total } = noticesService.list(page, limit, search);
  res.json({ data, pagination: { page, limit, total } });
}

// GET /api/v1/notices/:noticeId
export function getById(req: Request, res: Response): void {
  const notice = noticesService.getById(String(req.params.noticeId));
  res.json({ data: notice });
}

// POST /api/v1/notices
export function create(req: Request, res: Response): void {
  const { title, description } = req.body ?? {};

  if (typeof title !== 'string' || title.trim().length === 0) {
    throw new AppError(400, 'Title is required', 'MISSING_TITLE');
  }

  if (description !== undefined && typeof description !== 'string') {
  throw new AppError(400, 'Description must be a string', 'INVALID_DESCRIPTION');
}

  const notice = noticesService.create(title, description);
  res.status(201).json({ data: notice });
}

// PATCH /api/v1/notices/:noticeId
export function update(req: Request, res: Response): void {
  const { title, description } = req.body ?? {};

  if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
    res.status(400).json({ error: 'INVALID_TITLE', message: 'Title must be a non-empty string' });
    return;
  } 
  const notice = noticesService.update(
    String(req.params.noticeId),
    title,
    description,
  );


  if (!notice) {
    throw new AppError(404, 'notice not found', 'notice_NOT_FOUND');
  }

  res.json({ data: notice });
}
