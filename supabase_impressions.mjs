import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    env[match[1]] = val;
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function setup() {
  const sql = `
    ALTER TABLE public.articles
    ADD COLUMN IF NOT EXISTS impressions INT DEFAULT 0;

    CREATE OR REPLACE FUNCTION increment_impressions(row_id UUID)
    RETURNS void AS $$
    BEGIN
      UPDATE public.articles
      SET impressions = COALESCE(impressions, 0) + 1
      WHERE id = row_id;
    END;
    $$ LANGUAGE plpgsql;
    
    NOTIFY pgrst, 'reload schema';
  `;
  // I will write it to a .sql file for the user to run just like last time, since supabase js doesn't support raw SQL easily.
}
