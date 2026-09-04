const { createSessionToken } = require('../lib/session');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let body = req.body;
  if (!body || typeof body === 'string') {
    try { body = JSON.parse(body || '{}'); } catch { body = {}; }
  }

  const { password } = body || {};
  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'Server is not configured (ADMIN_PASSWORD missing)' });
  }
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Incorrect password' });
  }

  const token = createSessionToken();
  const secure = process.env.VERCEL ? 'Secure; ' : '';
  res.setHeader('Set-Cookie', `cb_session=${token}; HttpOnly; ${secure}SameSite=Strict; Path=/; Max-Age=43200`);
  res.status(200).json({ ok: true });
};
