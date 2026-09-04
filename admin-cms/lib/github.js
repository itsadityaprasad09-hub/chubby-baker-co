const API = 'https://api.github.com';

function headers() {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'chubby-baker-admin'
  };
}

function repoBase() {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  if (!owner || !repo) throw new Error('GITHUB_OWNER / GITHUB_REPO env vars are not set');
  return `${API}/repos/${owner}/${repo}`;
}

function branch() {
  return process.env.GITHUB_BRANCH || 'main';
}

// Reads a text file (JSON, etc). Returns { content: string|null, sha: string|null }.
async function getFile(path) {
  const res = await fetch(`${repoBase()}/contents/${encodeURI(path)}?ref=${branch()}`, { headers: headers() });
  if (res.status === 404) return { content: null, sha: null };
  if (!res.ok) throw new Error(`GitHub GET ${path} failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return { content: Buffer.from(data.content, 'base64').toString('utf-8'), sha: data.sha };
}

// Writes a text file. Pass sha when updating an existing file, null when creating a new one.
async function putFile(path, contentStr, message, sha) {
  const body = {
    message,
    content: Buffer.from(contentStr, 'utf-8').toString('base64'),
    branch: branch()
  };
  if (sha) body.sha = sha;
  const res = await fetch(`${repoBase()}/contents/${encodeURI(path)}`, {
    method: 'PUT',
    headers: { ...headers(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`GitHub PUT ${path} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

// Writes a binary file (image) given already-base64-encoded content.
async function putBinaryFile(path, base64Content, message, sha) {
  const body = { message, content: base64Content, branch: branch() };
  if (sha) body.sha = sha;
  const res = await fetch(`${repoBase()}/contents/${encodeURI(path)}`, {
    method: 'PUT',
    headers: { ...headers(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`GitHub PUT ${path} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function deleteFile(path, message, sha) {
  const res = await fetch(`${repoBase()}/contents/${encodeURI(path)}`, {
    method: 'DELETE',
    headers: { ...headers(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sha, branch: branch() })
  });
  if (!res.ok) throw new Error(`GitHub DELETE ${path} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

module.exports = { getFile, putFile, putBinaryFile, deleteFile };
