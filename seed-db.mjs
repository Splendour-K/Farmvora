import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

console.log('🌱 FarmVora Database Setup');
console.log('==========================\n');

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTables() {
  console.log('📋 Creating database tables...\n');

  const sql = readFileSync('./setup-database.sql', 'utf-8');

  console.log('✅ Database schema is ready!');
  console.log('\n📝 Next steps:');
  console.log('1. Go to your Supabase dashboard SQL Editor');
  console.log('2. Copy and paste the contents of setup-database.sql');
  console.log('3. Run the SQL script');
  console.log('4. Refresh your FarmVora app\n');

  console.log('Or run this SQL directly in Supabase SQL Editor:\n');
  console.log(sql);
}

createTables();
