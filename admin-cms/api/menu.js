const { getFile, putFile } = require('../lib/github');
const { isAuthed } = require('../lib/session');

module.exports = async (req, res) => {
  if (!isAuthed(req)) return res.status(401).json({ error: 'Not authenticated' });

  if (req.method === 'GET') {
    try {
      const { content } = await getFile('data/menu.json');
      res.status(200).json({ menu: JSON.parse(content || '[]') });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
    return;
  }

  if (req.method === 'POST') {
    try {
      let body = req.body;
      if (!body || typeof body === 'string') body = JSON.parse(body || '{}');
      const { menu } = body || {};
      if (!Array.isArray(menu)) return res.status(400).json({ error: 'menu must be an array' });

      const { sha } = await getFile('data/menu.json');
      const content = JSON.stringify(menu, null, 2) + '\n';
      await putFile('data/menu.json', content, 'Update menu via admin panel', sha);
      res.status(200).json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
};
