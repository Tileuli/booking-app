const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { signToken } = require('../utils/jwt');

const prisma = new PrismaClient();
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Проверьте, что вы ввели имя, email и пароль.' });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({ error: 'Этот email уже зарегистрирован.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: 'USER' },
      select: { id: true, name: true, email: true, role: true }
    });

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return res.status(201).json({ user, token });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Произошла ошибка на сервере. Попробуйте позже.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Введите email и пароль для входа.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль.' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Неверный email или пароль.' });
    }

    const safe = { id: user.id, name: user.name, email: user.email, role: user.role };
    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return res.json({ user: safe, token });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Произошла ошибка на сервере. Попробуйте позже.' });
  }
});

router.get('/me', async (req, res) => {
  const { user } = req;
  if (!user) {
    return res.status(401).json({ error: 'Необходима авторизация.' });
  }
  return res.json({ user });
});

module.exports = router;
