# FarmVora Database Setup Instructions

The application is ready, but the database tables need to be created first.

## Quick Setup Steps:

1. **Open your Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project

2. **Go to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Run the SQL Script**
   - Open the file `setup-database.sql` in this project
   - Copy ALL the contents
   - Paste into the Supabase SQL Editor
   - Click "Run" or press Cmd/Ctrl + Enter

4. **Refresh FarmVora**
   - Once the SQL runs successfully, refresh your browser
   - The app should now show the landing page with sample projects

## What Gets Created:

- ✅ `profiles` table (user accounts)
- ✅ `projects` table (agricultural projects)
- ✅ `investments` table (user investments)
- ✅ `weekly_updates` table (project progress updates)
- ✅ Row Level Security (RLS) policies for all tables
- ✅ 4 sample projects (Poultry, Maize, Greenhouse, Catfish farms)

## After Setup:

1. Sign up for an account
2. Browse the 4 sample projects
3. To become an admin, run this SQL in Supabase:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

That's it! Your FarmVora platform is ready to use.
