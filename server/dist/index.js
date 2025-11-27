"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/index.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const links_1 = __importDefault(require("./routes/links"));
const prisma_1 = __importDefault(require("./lib/prisma"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// health check
app.get('/healthz', (_req, res) => {
    res.status(200).json({ ok: true, version: '1.0' });
});
// API router
app.use('/api/links', links_1.default);
// Redirect route: GET /:code -> look up link, increment clicks & timestamp, redirect
app.get('/:code', async (req, res) => {
    const code = req.params.code;
    if (!code)
        return res.status(400).json({ error: 'Bad request' });
    const link = await prisma_1.default.link.findUnique({ where: { shortCode: code } });
    if (!link)
        return res.status(404).json({ error: 'Not found' });
    // update then redirect
    try {
        await prisma_1.default.link.update({
            where: { shortCode: code },
            data: { clicks: { increment: 1 }, lastClickedAt: new Date() }
        });
    }
    catch (err) {
        console.error('update click failed', err);
    }
    res.redirect(302, link.originalUrl);
});
// Start
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map