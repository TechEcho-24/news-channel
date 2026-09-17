import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const { data, error } = await supabase.from('contact_messages').insert({
    name: 'Test',
    email: 'test@example.com',
    subject: 'Other',
    message: 'Test'
  });
  
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Success");
  }
}

testInsert();
