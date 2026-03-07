import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://upmtdyxdiripnzcdlsng.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwbXRkeXhkaXJpcG56Y2Rsc25nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjU5MzQ5MSwiZXhwIjoyMDg4MTY5NDkxfQ.xOj6nsc4tuSoLKDbZn8s8JNfFjUnhtvxNe09FX_0s7Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('users').select('id, name, class_name');
  data.forEach(u => {
    console.log(`id: ${u.id}, class_name: "${u.class_name}"`);
  });
}
test();
