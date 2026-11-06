# Bot Service — Frontend

Standalone admin UI. Deploy separately from the backend (any static host / Vercel).

## Quick start

```bash
cp .env.example .env
# fill VITE_SUPABASE_* and VITE_API_BASE_URL (your backend URL, no trailing slash)
npm install
npm run dev
```

## Login on empty database

The login page calls `POST {VITE_API_BASE_URL}/api/setup/bootstrap` first.
That creates `admin@botservice.com` / `admin123456` in Supabase Auth if missing.

Then sign in with those credentials.

## Deploy on Vercel

1. Root Directory = `frontend`
2. Build command: `npm run build`
3. Output: `dist`
4. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE_URL`
5. Make sure the backend `CORS_ORIGIN` matches this frontend URL

Full docs: root [`README.md`](../README.md).
