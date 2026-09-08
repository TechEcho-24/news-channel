import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const env = fs.readFileSync('.env.local', 'utf8');
const SUPABASE_URL = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const SUPABASE_KEY = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const { data, error } = await supabase.rpc('get_policies');
  if (error) {
     const { data: d2, error: e2 } = await supabase.from('articles').select('*').limit(1);
     console.log("fallback select", e2 || "ok");
  } else {
     console.log(data);
  }
}
run();
