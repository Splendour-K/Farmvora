import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sjqhfwgpdseixafcepla.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqcWhmd2dwZHNlaXhhZmNlcGxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MTk0MTIsImV4cCI6MjA3OTM5NTQxMn0.SQ5yvmEyViqEw1yEixDOXOzMa169wShiPCwH8GXbwtM';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
