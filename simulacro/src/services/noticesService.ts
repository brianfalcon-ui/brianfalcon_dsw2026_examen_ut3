import { randomUUID } from 'node:crypto';
import { ResourceNotFoundError } from '../errors/ResourceNotFoundError.js';

interface Notice {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

// Datos en memoria: se pierden cada vez que el servidor se reinicia.
const notices: Notice[] = [
  {
    id: '11111111-1111-5111-8111-111111111111',
    title: 'Noticias de seguridad',
    description: '',
    createdAt: '2026-09-01T08:00:00.000Z',
  },
  {
    id: '22222222-2222-5222-8222-222222222222',
    title: 'Noticias del profesorado',
    description: '',
    createdAt: '2026-09-01T08:00:00.000Z',
  },
  {
    id: '33333333-3333-5333-8333-333333333333',
    title: 'Cancelacion de clases',
    description: '',
    createdAt: '2026-09-01T08:00:00.000Z',
  },
  {
    id: '44444444-4444-5444-8444-444444444444',
    title: 'Examen UT3',
    description: '',
    createdAt: '2026-09-01T08:00:00.000Z',
  },
  {
    id: '55555555-5555-5555-8555-555555555555',
    title: 'Apuntes subidos',
    description: '',
    createdAt: '2026-09-01T08:00:00.000Z',
  },
];

// GET /api/v1/notices?search=noticias&page=2&limit=1
export function list(page: number, limit: number, search?: string) {
  let results = notices;
  

  if (search) {
    results = results.filter((notice) =>
      notice.title.toLowerCase().includes(search.toLowerCase()),
    );
  }

  const start = (page - 1) * limit;

  return {
    data: results.slice(start, start + limit),
    total: results.length,
  };
}

// POST /api/v1/Notices

export function create(title: string, description?: string) {
  const Notice: Notice = {
    id: randomUUID(),
    title,
    description: description ?? '',
    createdAt: new Date().toISOString(),
  };
  notices.push(Notice);
  return Notice;
}

// GET /api/v1/Notices/:NoticeId
export function getById(NoticeId: string) {
  const Notice = notices.find((not) => not.id === NoticeId);

  if (!Notice) {
    throw new ResourceNotFoundError(
      404,
      `Notice with id '${NoticeId}' not found`,
      'RESOURCE_NOT_FOUND',
      NoticeId,
    );
  }

  return Notice;
}

// PATCH /api/v1/Notices/:NoticeId
export function update(NoticeId: string, title?: string, description?: string) {
  const Notice = notices.find((not) => not.id === NoticeId);

  if (!Notice) {
    return undefined;
  }

  if (title) {
    Notice.title = title;
  }
  if (description !== undefined) {
    Notice.description = description;
  }
  return Notice;
}
