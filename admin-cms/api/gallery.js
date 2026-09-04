const { getFile, putFile, putBinaryFile, deleteFile } = require('../lib/github');
const { isAuthed } = require('../lib/session');

async function readJsonFile(path) {
  const { content, sha } = await getFile(path);
  return { arr: JSON.parse(content || '[]'), sha };
}

module.exports = async (req, res) => {
  if (!isAuthed(req)) return res.status(401).json({ error: 'Not authenticated' });

  if (req.method === 'GET') {
    try {
      const gallery = await readJsonFile('data/gallery.json');
      const occasions = await readJsonFile('data/occasions.json');
      res.status(200).json({ gallery: gallery.arr, occasions: occasions.arr });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
    return;
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let body = req.body;
  if (!body || typeof body === 'string') {
    try { body = JSON.parse(body || '{}'); } catch { body = {}; }
  }
  const { action } = body || {};

  try {
    if (action === 'upload') {
      const { filename, imageBase64, caption, category } = body;
      if (!filename || !imageBase64) {
        return res.status(400).json({ error: 'filename and imageBase64 are required' });
      }
      // imageBase64 may come as a data URL ("data:image/jpeg;base64,...."); strip the prefix if present.
      const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
      const safeName = filename.toLowerCase().replace(/[^a-z0-9._-]/g, '-');
      const path = `assets/gallery/${Date.now()}-${safeName}`;

      await putBinaryFile(path, base64Data, `Add photo ${safeName} via admin panel`, null);

      const gallery = await readJsonFile('data/gallery.json');
      gallery.arr.push({ url: path, caption: caption || '' });
      await putFile('data/gallery.json', JSON.stringify(gallery.arr, null, 2) + '\n', 'Add photo to gallery via admin panel', gallery.sha);

      if (category) {
        const occasions = await readJsonFile('data/occasions.json');
        occasions.arr.push({ url: path, caption: caption || '', category });
        await putFile('data/occasions.json', JSON.stringify(occasions.arr, null, 2) + '\n', 'Add photo to occasions via admin panel', occasions.sha);
      }

      return res.status(200).json({ ok: true, url: path });
    }

    if (action === 'updateCaption') {
      const { url, caption, category } = body;
      if (!url) return res.status(400).json({ error: 'url is required' });

      const gallery = await readJsonFile('data/gallery.json');
      gallery.arr = gallery.arr.map((x) => (x.url === url ? { ...x, caption } : x));
      await putFile('data/gallery.json', JSON.stringify(gallery.arr, null, 2) + '\n', 'Update caption via admin panel', gallery.sha);

      if (category) {
        const occasions = await readJsonFile('data/occasions.json');
        const idx = occasions.arr.findIndex((x) => x.url === url);
        if (idx >= 0) occasions.arr[idx] = { ...occasions.arr[idx], caption, category };
        else occasions.arr.push({ url, caption, category });
        await putFile('data/occasions.json', JSON.stringify(occasions.arr, null, 2) + '\n', 'Update occasion via admin panel', occasions.sha);
      }

      return res.status(200).json({ ok: true });
    }

    if (action === 'delete') {
      const { url, deleteImageFile } = body;
      if (!url) return res.status(400).json({ error: 'url is required' });

      const gallery = await readJsonFile('data/gallery.json');
      const wasInGallery = gallery.arr.some((x) => x.url === url);
      if (wasInGallery) {
        gallery.arr = gallery.arr.filter((x) => x.url !== url);
        await putFile('data/gallery.json', JSON.stringify(gallery.arr, null, 2) + '\n', 'Remove photo from gallery via admin panel', gallery.sha);
      }

      const occasions = await readJsonFile('data/occasions.json');
      const wasInOccasions = occasions.arr.some((x) => x.url === url);
      if (wasInOccasions) {
        occasions.arr = occasions.arr.filter((x) => x.url !== url);
        await putFile('data/occasions.json', JSON.stringify(occasions.arr, null, 2) + '\n', 'Remove photo from occasions via admin panel', occasions.sha);
      }

      if (deleteImageFile) {
        const { sha } = await getFile(url);
        if (sha) await deleteFile(url, 'Remove photo file via admin panel', sha);
      }

      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
