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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.rpc('increment_impressions', { row_id: '5dba0ccf-0f21-45f5-8a18-ce9e691e8c8b' });
  console.log("RPC result with anon key:", {data, error});
  
  const { data: db } = await supabase.from('articles').select('impressions, title').eq('id', '5dba0ccf-0f21-45f5-8a18-ce9e691e8c8b');
  console.log("DB after anon:", db);
}
test();
