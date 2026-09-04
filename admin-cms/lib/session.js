const crypto = require('crypto');

function secret() {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || 'fallback-secret-change-me';
}

function sign(payload) {
  return crypto.createHmac('sha256', secret()).update(payload).digest('hex');
}

function createSessionToken() {
  const expiry = Date.now() + 1000 * 60 * 60 * 12; // 12 hour session
  const payload = String(expiry);
  const sig = sign(payload);
  return Buffer.from(`${payload}.${sig}`).toString('base64');
}

function verifySessionToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [payload, sig] = decoded.split('.');
    if (!payload || !sig) return false;
    const expectedSig = sign(payload);
    const sigBuf = Buffer.from(sig, 'hex');
    const expBuf = Buffer.from(expectedSig, 'hex');
    if (sigBuf.length !== expBuf.length) return false;
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return false;
    if (Date.now() > Number(payload)) return false;
    return true;
  } catch (e) {
    return false;
  }
}

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  header.split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  });
  return out;
}

function isAuthed(req) {
  const cookies = parseCookies(req.headers.cookie);
  return verifySessionToken(cookies.cb_session || '');
}

module.exports = { createSessionToken, verifySessionToken, parseCookies, isAuthed };
