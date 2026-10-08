import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { notFound } from '../lib/errors';
import { requireAuth } from '../middleware/auth';
import { idParam } from '../schemas/common';
import { createTaskSchema, listTasksQuery, updateTaskSchema } from '../schemas/task';

const router = Router();
router.use(requireAuth);

// A task belongs to the user who owns its project.
const owned = (userId: string) => ({ project: { userId } });

router.get('/', async (req, res) => {
  const { search, status, priority, projectId, page, limit } = listTasksQuery.parse(req.query);
  const where: Prisma.TaskWhereInput = {
    ...owned(req.userId),
    ...(status && { status }),
    ...(priority && { priority }),
    ...(projectId && { projectId }),
    ...(search && { name: { contains: search, mode: 'insensitive' } }),
  };
  const [data, total] = await Promise.all([
    prisma.task.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
    prisma.task.count({ where }),
  ]);
  res.json({ data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

router.get('/:id', async (req, res) => {
  const { id } = idParam.parse(req.params);
  const task = await prisma.task.findFirst({ where: { id, ...owned(req.userId) } });
  if (!task) throw notFound('Task');
  res.json({ data: task });
});

router.post('/', async (req, res) => {
  const { projectId, ...body } = createTaskSchema.parse(req.body);
  const project = await prisma.project.findFirst({ where: { id: projectId, userId: req.userId } });
  if (!project) throw notFound('Project');
  const task = await prisma.task.create({ data: { ...body, projectId } });
  res.status(201).json({ data: task });
});

router.put('/:id', async (req, res) => {
  const { id } = idParam.parse(req.params);
  const body = updateTaskSchema.parse(req.body);
  const existing = await prisma.task.findFirst({ where: { id, ...owned(req.userId) } });
  if (!existing) throw notFound('Task');
  const task = await prisma.task.update({ where: { id }, data: body });
  res.json({ data: task });
});

router.delete('/:id', async (req, res) => {
  const { id } = idParam.parse(req.params);
  const { count } = await prisma.task.deleteMany({ where: { id, ...owned(req.userId) } });
  if (!count) throw notFound('Task');
  res.status(204).end();
});

export default router;
