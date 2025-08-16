const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

const requireAuth = require('./middleware/requireAuth');
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/api/organizations', async (_req, res) => {
  const items = await prisma.organization.findMany({ orderBy: { id: 'asc' } });
  res.json(items);
});

app.get('/api/organizations/:id/specialists', async (req, res) => {
  const orgId = Number(req.params.id);
  const items = await prisma.specialist.findMany({
    where: { organizationId: orgId },
    orderBy: { id: 'asc' }
  });
  res.json(items);
});

const appointmentsRouter = require('./routes/appointments');
app.use('/api', (req, res, next) => {
  if (req.method === 'POST' && req.path === '/appointments') {
    return requireAuth(req, res, next);
  }
  return next();
});
app.use('/api', appointmentsRouter);

app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
