import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const sql = readFileSync('/tmp/setup_db.sql', 'utf-8');

console.log('Setting up FarmVora database...\n');

const statements = sql.split(';').filter(s => s.trim().length > 0);

for (let i = 0; i < statements.length; i++) {
  const statement = statements[i].trim() + ';';

  if (statement.length < 5) continue;

  console.log(`Executing statement ${i + 1}/${statements.length}...`);

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement });

    if (error) {
      console.error(`Error on statement ${i + 1}:`, error.message);
    } else {
      console.log(`✓ Statement ${i + 1} executed successfully`);
    }
  } catch (err) {
    console.error(`Error on statement ${i + 1}:`, err.message);
  }
}

console.log('\nDatabase setup complete!');
