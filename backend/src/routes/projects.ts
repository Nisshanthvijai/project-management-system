import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { notFound } from '../lib/errors';
import { requireAuth } from '../middleware/auth';
import { idParam } from '../schemas/common';
import { createProjectSchema, listProjectsQuery, updateProjectSchema } from '../schemas/project';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const { search, status, page, limit } = listProjectsQuery.parse(req.query);
  const where: Prisma.ProjectWhereInput = {
    userId: req.userId,
    ...(status && { status }),
    ...(search && { name: { contains: search, mode: 'insensitive' } }),
  };
  const [data, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { _count: { select: { tasks: true } } },
    }),
    prisma.project.count({ where }),
  ]);
  res.json({ data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

router.get('/:id', async (req, res) => {
  const { id } = idParam.parse(req.params);
  const project = await prisma.project.findFirst({
    where: { id, userId: req.userId },
    include: { _count: { select: { tasks: true } } },
  });
  if (!project) throw notFound('Project');
  res.json({ data: project });
});

router.post('/', async (req, res) => {
  const body = createProjectSchema.parse(req.body);
  const project = await prisma.project.create({ data: { ...body, userId: req.userId } });
  res.status(201).json({ data: project });
});

router.put('/:id', async (req, res) => {
  const { id } = idParam.parse(req.params);
  const body = updateProjectSchema.parse(req.body);
  const existing = await prisma.project.findFirst({ where: { id, userId: req.userId } });
  if (!existing) throw notFound('Project');
  const project = await prisma.project.update({ where: { id }, data: body });
  res.json({ data: project });
});

router.delete('/:id', async (req, res) => {
  const { id } = idParam.parse(req.params);
  const { count } = await prisma.project.deleteMany({ where: { id, userId: req.userId } });
  if (!count) throw notFound('Project');
  res.status(204).end();
});

export default router;
