const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { DateTime } = require('luxon');
const requireAuth = require('../middleware/requireAuth');

const prisma = new PrismaClient();
const router = express.Router();

function buildSlots(start, end, step) {
  const arr = [];
  for (let m = start; m < end; m += step) arr.push(m);
  return arr;
}

// Получение слотов с учётом часового пояса филиала
router.get('/specialists/:id/slots', async (req, res) => {
  const specialistId = Number(req.params.id);
  const dateStr = req.query.date;
  if (!dateStr) return res.status(400).json({ error: 'date is required (YYYY-MM-DD)' });

  const spec = await prisma.specialist.findUnique({
    where: { id: specialistId },
    include: { organization: true }
  });
  if (!spec) return res.status(404).json({ error: 'Specialist not found' });

  const tz = spec.organization.timeZone;
  const date = DateTime.fromISO(dateStr, { zone: tz });
  const dayOfWeek = date.weekday % 7;

  const schedule = await prisma.schedule.findUnique({
    where: { specialistId_dayOfWeek: { specialistId, dayOfWeek } }
  });
  if (!schedule) return res.json({ slots: [] });

  const allSlots = buildSlots(schedule.startTimeMin, schedule.endTimeMin, schedule.slotSizeMin);

  const dayStartUTC = date.startOf("day").toUTC().toJSDate();
  const dayEndUTC = date.endOf("day").toUTC().toJSDate();

  const appointments = await prisma.appointment.findMany({
    where: {
      specialistId,
      startAt: { gte: dayStartUTC, lte: dayEndUTC },
      status: { in: ['PENDING', 'CONFIRMED'] }
    },
    select: { startAt: true }
  });

  const busy = new Set(
    appointments.map(a => {
      const local = DateTime.fromJSDate(a.startAt, { zone: 'utc' }).setZone(tz);
      return local.hour * 60 + local.minute;
    })
  );

  const freeSlots = allSlots.filter(m => !busy.has(m));
  res.json({ slots: freeSlots });
});

// Создание брони с конвертацией в UTC
router.post('/appointments', requireAuth, async (req, res) => {
  try {
    const { specialistId, date, minutesFromMidnight, durationMin = 30 } = req.body;
    const userId = req.user.id;

    if (!specialistId || !date || minutesFromMidnight == null) {
      return res.status(400).json({ error: 'specialistId, date, minutesFromMidnight required' });
    }

    const spec = await prisma.specialist.findUnique({
      where: { id: specialistId },
      include: { organization: true }
    });
    if (!spec) return res.status(404).json({ error: 'Specialist not found' });

    const tz = spec.organization.timeZone;
    const localDT = DateTime.fromISO(date, { zone: tz }).plus({ minutes: minutesFromMidnight });
    const startAtUTC = localDT.toUTC();

    if (startAtUTC < DateTime.utc()) {
      return res.status(400).json({ error: 'Cannot book past time' });
    }

    const conflict = await prisma.appointment.findFirst({
      where: { specialistId, startAt: startAtUTC.toJSDate(), status: { in: ['PENDING', 'CONFIRMED'] } },
    });
    if (conflict) return res.status(409).json({ error: 'slot already booked' });

    const ap = await prisma.appointment.create({
      data: { userId, specialistId, startAt: startAtUTC.toJSDate(), durationMin },
      include: { specialist: { include: { organization: true } } },
    });
    return res.status(201).json(ap);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/my-appointments', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const items = await prisma.appointment.findMany({
      where: { userId },
      orderBy: { startAt: 'asc' },
      include: { specialist: { include: { organization: true } } },
    });
    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/appointments/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const ap = await prisma.appointment.findUnique({ where: { id } });
    if (!ap) return res.status(404).json({ error: 'Not found' });

    const isOwner = ap.userId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Forbidden' });

    if (ap.startAt < new Date()) {
      return res.status(400).json({ error: 'Cannot cancel past appointment' });
    }

    await prisma.appointment.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
