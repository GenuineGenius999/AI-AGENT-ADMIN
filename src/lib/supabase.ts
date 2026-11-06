import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
// const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const anonKey = "sb_publishable_mFE3zhNKupUk3wbCGJzF-Q_h-_2SoFq";

if (!url || !anonKey) {
  console.warn(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to frontend/.env'
  );
}

export const supabase = createClient(url || '', anonKey || '');
