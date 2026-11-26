import type { Request, Response } from 'express';
import * as noticesService from '../services/noticesService.js';
import { AppError } from '../errors/AppError.js';

// GET /api/v1/notices?page=1&limit=2
export function list(req: Request, res: Response): void {
  // req.query SIEMPRE llega como texto: "2", no 2. Hay que convertirlo.
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 2);

  if (!Number.isInteger(page) || !Number.isInteger(limit) || page < 1 || limit < 1) {
    throw new AppError(400, 'page and limit must be positive integers', 'INVALID_PAGINATION');
  }

  // Un search formado solo por espacios cuenta como vacío: no filtra.
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined;
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

  const notice = noticesService.create(title.trim(), description);
  res.status(201).json({ data: notice });
}

// PATCH /api/v1/notices/:noticeId
export function update(req: Request, res: Response): void {
  const { title, description } = req.body ?? {};

  // Las dos validaciones van antes de llamar al servicio: si una falla, no se modifica nada.
  if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
    throw new AppError(400, 'Title must be a non-empty string', 'INVALID_TITLE');
  }

  if (description !== undefined && typeof description !== 'string') {
    throw new AppError(400, 'Description must be a string', 'INVALID_DESCRIPTION');
  }

  const notice = noticesService.update(String(req.params.noticeId), title?.trim(), description);
  res.json({ data: notice });
}
