import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const userId = req.userId;
  const taskScope = { project: { userId } };
  const [totalProjects, totalTasks, completedTasks, pendingTasks, inProgressTasks, projectsInProgress] =
    await Promise.all([
      prisma.project.count({ where: { userId } }),
      prisma.task.count({ where: taskScope }),
      prisma.task.count({ where: { ...taskScope, status: 'COMPLETED' } }),
      prisma.task.count({ where: { ...taskScope, status: 'PENDING' } }),
      prisma.task.count({ where: { ...taskScope, status: 'IN_PROGRESS' } }),
      prisma.project.count({ where: { userId, status: 'IN_PROGRESS' } }),
    ]);
  res.json({
    data: { totalProjects, totalTasks, completedTasks, pendingTasks, inProgressTasks, projectsInProgress },
  });
});

export default router;
