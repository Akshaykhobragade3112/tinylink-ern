// server/src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import linksRouter from '../routes/links';
import prisma from '../lib/prisma';
import { Request, Response } from 'express';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(express.json());

// health check
app.get('/healthz', (_req: Request, res: Response) => {
  res.status(200).json({ ok: true, version: '1.0' });
});

// API router
app.use('/api/links', linksRouter);

// Redirect route: GET /:code -> look up link, increment clicks & timestamp, redirect
app.get('/:code', async (req: Request, res: Response) => {
  const code = req.params.code;
  if (!code) return res.status(400).json({ error: 'Bad request' });

  const link = await prisma.link.findUnique({ where: { shortCode: code } });
  if (!link) return res.status(404).json({ error: 'Not found' });

  // update then redirect
  try {
    await prisma.link.update({
      where: { shortCode: code },
      data: { clicks: { increment: 1 }, lastClickedAt: new Date() }
    });
  } catch (err) {
    console.error('update click failed', err);
  }

  res.redirect(302, link.originalUrl);
});

// Start
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
