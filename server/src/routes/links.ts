// server/src/routes/links.ts
import express, { Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = express.Router();

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

// Helper: validate URL
function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * POST /api/links
 * body: { url, code? }
 * - validate custom code with regex
 * - return 409 if code exists
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { url, code } = req.body;
    if (!url || typeof url !== 'string' || !isValidUrl(url)) {
      return res.status(400).json({ error: 'Invalid URL' });
    }

    if (code) {
      if (typeof code !== 'string' || !CODE_REGEX.test(code)) {
        return res.status(400).json({ error: 'Custom code must match [A-Za-z0-9]{6,8}' });
      }
      const existing = await prisma.link.findUnique({ where: { shortCode: code } });
      if (existing) return res.status(409).json({ error: 'Code already exists' });
      const created = await prisma.link.create({
        data: { shortCode: code, originalUrl: url }
      });
      return res.status(201).json(created);
    }

    // generate 6 char code
    const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    function gen(n = 6) {
      return Array.from({ length: n }).map(() => alpha[Math.floor(Math.random() * alpha.length)]).join('');
    }

    let shortCode: string | undefined;
    for (let i = 0; i < 6; i++) {
      const candidate = gen(6);
      const exists = await prisma.link.findUnique({ where: { shortCode: candidate } });
      if (!exists) {
        shortCode = candidate;
        break;
      }
    }
    if (!shortCode) shortCode = Date.now().toString(36).slice(-6);

    const created = await prisma.link.create({
      data: { shortCode, originalUrl: url }
    });

    return res.status(201).json(created);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/links
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const links = await prisma.link.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.json(links);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/links/:code  -> stats
 */
router.get('/:code', async (req: Request, res: Response) => {
  const code = req.params.code;
  const link = await prisma.link.findUnique({ where: { shortCode: code } });
  if (!link) return res.status(404).json({ error: 'Not found' });
  return res.json(link);
});

/**
 * DELETE /api/links/:code
 */
router.delete('/:code', async (req: Request, res: Response) => {
  const code = req.params.code;
  const link = await prisma.link.findUnique({ where: { shortCode: code } });
  if (!link) return res.status(404).json({ error: 'Not found' });

  await prisma.link.delete({ where: { shortCode: code } });
  return res.json({ ok: true });
});

export default router;
