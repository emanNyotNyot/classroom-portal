import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://upmtdyxdiripnzcdlsng.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwbXRkeXhkaXJpcG56Y2Rsc25nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjU5MzQ5MSwiZXhwIjoyMDg4MTY5NDkxfQ.xOj6nsc4tuSoLKDbZn8s8JNfFjUnhtvxNe09FX_0s7Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('users').select('*');
  console.log('Data:', data);
  console.log('Error:', error);
}

check();
