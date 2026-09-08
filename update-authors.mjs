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

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey || !supabaseUrl) {
  console.log("No service role key or URL found. Skipping.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function update() {
  const { data, error } = await supabase
    .from('articles')
    .update({ author_name: 'Anuj Sachan' })
    .or('author_name.eq.Admin,author_name.is.null');

  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Updated successfully!");
  }
}
update();
