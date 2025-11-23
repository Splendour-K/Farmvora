/*
  # FarmVora Complete Database Schema

  ## Overview
  Creates a complete investment platform for agricultural projects in Africa.

  ## New Tables
  
  ### 1. profiles
  - `id` (uuid, primary key) - References auth.users
  - `email` (text, unique) - User email
  - `full_name` (text) - Full name
  - `role` (text) - User role: 'investor' or 'admin'
  - `country` (text) - User country
  - `created_at` (timestamptz) - Account creation time
  
  ### 2. projects
  - `id` (uuid, primary key) - Unique project identifier
  - `title` (text) - Project name
  - `description` (text) - Detailed project description
  - `location` (text) - Project location
  - `category` (text) - Agriculture category
  - `required_capital` (numeric) - Total funding needed
  - `current_funding` (numeric) - Amount raised so far
  - `expected_roi` (numeric) - Expected return on investment percentage
  - `duration_months` (integer) - Project duration
  - `start_date` (date) - Project start date
  - `expected_harvest_date` (date) - Expected completion date
  - `risk_level` (text) - Risk assessment: 'low', 'medium', 'high'
  - `status` (text) - Current status: 'upcoming', 'active', 'completed'
  - `owner_name` (text) - Farmer/project owner name
  - `owner_bio` (text) - Owner background information
  - `created_by` (uuid) - Reference to admin who created it
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 3. investments
  - `id` (uuid, primary key) - Unique investment identifier
  - `investor_id` (uuid) - Reference to investor profile
  - `project_id` (uuid) - Reference to project
  - `amount` (numeric) - Investment amount
  - `expected_return` (numeric) - Expected return amount
  - `status` (text) - Investment status: 'active', 'completed'
  - `invested_at` (timestamptz) - Investment timestamp
  
  ### 4. weekly_updates
  - `id` (uuid, primary key) - Unique update identifier
  - `project_id` (uuid) - Reference to project
  - `week_number` (integer) - Week number of the update
  - `title` (text) - Update title
  - `description` (text) - Update details
  - `image_url` (text) - Optional image URL
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  
  All tables have Row Level Security (RLS) enabled with appropriate policies:
  
  - **Profiles**: Authenticated users can read all profiles, but can only update their own
  - **Projects**: All authenticated users can view projects; only admins can create/update
  - **Investments**: Users can only see and create their own investments; admins can see all
  - **Weekly Updates**: All authenticated users can view; only admins can create/update
  
  ## Performance
  
  Indexes are created on frequently queried columns:
  - Project status and category
  - Investment relationships
  - Weekly update relationships
  
  ## Sample Data
  
  Four sample agricultural projects are inserted to demonstrate the platform:
  1. Poultry Farm in Ghana
  2. Maize Farm in Kenya
  3. Greenhouse Tomatoes in Nigeria
  4. Catfish Farm in Rwanda
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'investor',
  country text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Anyone can read profiles" ON profiles;
CREATE POLICY "Anyone can read profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  category text NOT NULL,
  required_capital numeric NOT NULL,
  current_funding numeric DEFAULT 0,
  expected_roi numeric NOT NULL,
  duration_months integer NOT NULL,
  start_date date NOT NULL,
  expected_harvest_date date NOT NULL,
  risk_level text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'upcoming',
  owner_name text NOT NULL,
  owner_bio text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Projects policies
DROP POLICY IF EXISTS "Anyone can read projects" ON projects;
CREATE POLICY "Anyone can read projects"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can create projects" ON projects;
CREATE POLICY "Admins can create projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update projects" ON projects;
CREATE POLICY "Admins can update projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create investments table
CREATE TABLE IF NOT EXISTS investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  expected_return numeric NOT NULL,
  status text NOT NULL DEFAULT 'active',
  invested_at timestamptz DEFAULT now()
);

ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- Investments policies
DROP POLICY IF EXISTS "Users can read own investments" ON investments;
CREATE POLICY "Users can read own investments"
  ON investments FOR SELECT
  TO authenticated
  USING (auth.uid() = investor_id);

DROP POLICY IF EXISTS "Users can create investments" ON investments;
CREATE POLICY "Users can create investments"
  ON investments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = investor_id);

DROP POLICY IF EXISTS "Admins can read all investments" ON investments;
CREATE POLICY "Admins can read all investments"
  ON investments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create weekly_updates table
CREATE TABLE IF NOT EXISTS weekly_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  week_number integer NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE weekly_updates ENABLE ROW LEVEL SECURITY;

-- Weekly updates policies
DROP POLICY IF EXISTS "Anyone can read updates" ON weekly_updates;
CREATE POLICY "Anyone can read updates"
  ON weekly_updates FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can create updates" ON weekly_updates;
CREATE POLICY "Admins can create updates"
  ON weekly_updates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update updates" ON weekly_updates;
CREATE POLICY "Admins can update updates"
  ON weekly_updates FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_investments_investor ON investments(investor_id);
CREATE INDEX IF NOT EXISTS idx_investments_project ON investments(project_id);
CREATE INDEX IF NOT EXISTS idx_weekly_updates_project ON weekly_updates(project_id);

-- Insert sample projects (without created_by since no admin exists yet)
INSERT INTO projects (title, description, location, category, required_capital, current_funding, expected_roi, duration_months, start_date, expected_harvest_date, risk_level, status, owner_name, owner_bio)
VALUES
  ('Poultry Farm - Ghana', 'Large-scale poultry farming operation focusing on free-range chicken production. This project aims to supply local markets with high-quality chicken and eggs while creating sustainable employment opportunities.', 'Accra, Ghana', 'Poultry', 45000, 28000, 18, 7, '2025-01-15', '2025-08-15', 'low', 'active', 'Kwame Mensah', 'Experienced poultry farmer with 15 years in the industry'),
  ('Maize Farm - Kenya', 'Commercial maize cultivation using modern irrigation and farming techniques. Expected to produce 500 tons of maize for both local consumption and export markets.', 'Nakuru, Kenya', 'Maize', 35000, 21000, 12, 5, '2025-02-01', '2025-07-01', 'medium', 'active', 'Grace Wanjiru', 'Third-generation farmer specializing in grain crops'),
  ('Greenhouse Tomatoes - Nigeria', 'State-of-the-art greenhouse facility for year-round tomato production. Using hydroponic systems to maximize yield and minimize water usage.', 'Lagos, Nigeria', 'Greenhouse', 60000, 42000, 20, 6, '2025-01-20', '2025-07-20', 'low', 'active', 'Adebayo Okonkwo', 'Agricultural engineer with expertise in greenhouse farming'),
  ('Catfish Farm - Rwanda', 'Sustainable aquaculture project focused on catfish production. Using recirculating aquaculture systems to ensure environmental sustainability and consistent yield.', 'Kigali, Rwanda', 'Aquaculture', 40000, 15000, 16, 8, '2025-02-10', '2025-10-10', 'medium', 'upcoming', 'Jean Paul Uwimana', 'Marine biologist with 10 years in aquaculture')
ON CONFLICT DO NOTHING;