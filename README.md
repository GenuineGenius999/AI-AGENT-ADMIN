# Bot Service — Frontend

Standalone admin UI. Deploy separately from the backend (any static host).

## Quick start

```bash
cp .env.example .env
# fill VITE_SUPABASE_* and VITE_API_BASE_URL (your backend URL)
npm install
npm run dev
```

Login with the admin account created by the backend (`admin@botservice.com` / `admin123456`).

See `.env.example` for variables. Full docs: root [`README.md`](../README.md).
