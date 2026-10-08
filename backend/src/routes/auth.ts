import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { AppError, notFound } from '../lib/errors';
import { requireAuth } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';
import { loginSchema, registerSchema } from '../schemas/auth';

const router = Router();

const publicUser = { id: true, fullName: true, email: true, createdAt: true } as const;

const signToken = (userId: string) =>
  jwt.sign({ sub: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

router.post('/register', authLimiter, async (req, res) => {
  const { fullName, email, password } = registerSchema.parse(req.body);
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new AppError(409, 'EMAIL_TAKEN', 'Email is already registered');

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { fullName, email, passwordHash },
    select: publicUser,
  });
  res.status(201).json({ user, token: signToken(user.id) });
});

router.post('/login', authLimiter, async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email } });
  const ok = user && (await bcrypt.compare(password, user.passwordHash));
  if (!user || !ok) throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');

  const { passwordHash: _omit, ...safe } = user;
  res.json({ user: safe, token: signToken(user.id) });
});

// Stateless JWT: the client discards the token. Endpoint exists so both apps share one flow.
router.post('/logout', requireAuth, (_req, res) => {
  res.status(204).end();
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId }, select: publicUser });
  if (!user) throw notFound('User');
  res.json({ user });
});

export default router;
