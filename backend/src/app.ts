import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { corsOrigins } from './config/env';
import { logger } from './lib/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';
import dashboardRoutes from './routes/dashboard';

export const app = express();

app.set('trust proxy', 1); // behind Render/Railway proxy, so rate limiting sees real client IPs
app.use(helmet());
app.use(pinoHttp({ logger }));
app.use(
  cors({
    // Native mobile requests send no Origin header; browsers must match the allow-list.
    origin: (origin, cb) => cb(null, !origin || corsOrigins.includes(origin)),
  }),
);
app.use(express.json({ limit: '100kb' }));

app.get('/', (_req, res) => res.json({ name: 'Project Management API', status: 'ok', health: '/health' }));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
