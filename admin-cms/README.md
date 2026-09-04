# Chubby Baker & Co — Admin Panel

A tiny password-protected panel to edit the **menu** and **gallery/occasions photos**
without ever pasting a GitHub token into a chat again. It writes directly to this
repo (`data/menu.json`, `data/gallery.json`, `data/occasions.json`, `assets/gallery/`)
using a token stored securely on Vercel — never visible in the browser, never shared
with anyone, never needs revoking after use.

## One-time setup (~10 minutes)

### 1. Create a GitHub token (do this once, forever)
1. Go to **github.com → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. Give it a name like `chubby-baker-admin`.
3. **Repository access:** select "Only select repositories" → choose `chubby-baker-co`.
4. **Permissions:** under "Repository permissions", set **Contents: Read and write**. Leave everything else as "No access".
5. Set an expiry (1 year is fine — GitHub will let you regenerate it later if it expires; you won't need to touch this project's code when that happens, just update the Vercel env var).
6. Generate it and copy the token — you'll paste it into Vercel in step 3, not here in chat.

### 2. Create a new Vercel project for this folder
1. In Vercel, click **Add New → Project**.
2. Import the `chubby-baker-co` GitHub repo (the same one the site already lives in).
3. Under **Root Directory**, click Edit and select `admin-cms`.
4. Framework preset: **Other**. Leave build/output settings blank (there's nothing to build).

### 3. Add environment variables
In the new Vercel project → **Settings → Environment Variables**, add:

| Name              | Value                                             |
|-------------------|----------------------------------------------------|
| `GITHUB_TOKEN`    | the token you generated in step 1                  |
| `GITHUB_OWNER`    | `itsadityaprasad09-hub`                            |
| `GITHUB_REPO`     | `chubby-baker-co`                                  |
| `GITHUB_BRANCH`   | `main`                                             |
| `ADMIN_PASSWORD`  | a password you choose for logging into the panel   |
| `SESSION_SECRET`  | any other random string (e.g. mash the keyboard)   |

Deploy. Vercel will give you a URL like `chubby-baker-admin.vercel.app`.

### 4. Use it
Open the URL, enter your `ADMIN_PASSWORD`, and you'll see two tabs:
- **Menu** — edit item names/prices/quantities, add or remove items and whole categories, then **Save Menu**.
- **Gallery & Occasions** — upload a new photo (auto-resized in your browser before upload so it stays small and fast), tag it with an occasion, edit captions, or delete photos.

Every save creates a real commit on the `chubby-baker-co` repo and GitHub Pages
rebuilds automatically — changes go live in about a minute.

## How it stays secure
- The GitHub token lives only as a Vercel environment variable. It is never sent to
  the browser, never printed anywhere, and never appears in this repo's code.
- The admin page itself is behind a password; the session cookie is signed
  (HMAC) and expires after 12 hours.
- If you ever suspect the token leaked, just delete it from GitHub settings and
  generate a new one — no code changes needed, just update the Vercel env var.

## Local testing (optional)
This has no npm dependencies (uses Node 18's built-in `fetch`), so `vercel dev`
in this folder with a `.env.local` containing the same variables as above will
run it locally.
