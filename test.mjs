import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const env = fs.readFileSync('.env.local', 'utf8');
const SUPABASE_URL = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1];
const SUPABASE_KEY = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1];
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
async function run() {
  const { data, error } = await supabase.from('articles').select('id').limit(1);
  console.log("SELECT works?", !!data);
  // Actually we want to check RLS.
  // We can just write a raw SQL file for the user to run to fix the policy!
}
run();
