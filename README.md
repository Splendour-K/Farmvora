# FarmVora - Agricultural Investment Platform

A full-stack web application connecting diaspora Africans and students with verified agricultural investment opportunities across Africa.

## Features

- **Landing Page** - Hero section explaining the platform's value proposition
- **User Authentication** - Secure email/password signup and login
- **Project Marketplace** - Browse agricultural projects with advanced filtering
- **Project Details** - View detailed project information with weekly progress updates
- **Investment System** - Invest in projects and track your portfolio
- **Investor Dashboard** - Monitor your investments, returns, and project status
- **Admin Dashboard** - Create projects and post weekly updates (admin only)

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

The `.env` file is already configured with your Supabase credentials:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 3. Database Setup (REQUIRED)

**You must run the database setup before using the app.**

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click "SQL Editor" in the sidebar
4. Click "New Query"
5. Open `setup-database.sql` from this project
6. Copy ALL contents and paste into the SQL Editor
7. Click "Run" (or press Cmd/Ctrl + Enter)

This will create:
- All required database tables (profiles, projects, investments, weekly_updates)
- Row Level Security policies
- Database indexes
- 4 sample projects to get started

### 4. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Using FarmVora

### As an Investor:

1. **Sign Up** - Create an account from the landing page
2. **Browse Projects** - View all available agricultural projects
3. **View Details** - Click any project to see full details and weekly updates
4. **Invest** - Click "Invest Now" and enter your investment amount
5. **Track Portfolio** - View your dashboard to monitor all investments

### As an Admin:

1. Sign up for a regular account first
2. In Supabase SQL Editor, run:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
   ```
3. Refresh the app - you'll now see "Admin Dashboard"
4. **Create Projects** - Add new agricultural investment opportunities
5. **Post Updates** - Add weekly progress updates with photos

## Sample Projects Included

After running the database setup, you'll have 4 sample projects:

1. **Poultry Farm - Ghana** (18% ROI, 7 months)
2. **Maize Farm - Kenya** (12% ROI, 5 months)
3. **Greenhouse Tomatoes - Nigeria** (20% ROI, 6 months)
4. **Catfish Farm - Rwanda** (16% ROI, 8 months)

## Project Structure

```
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── auth/          # Login and Signup forms
│   │   ├── landing/       # Hero section
│   │   └── projects/      # Project card component
│   ├── contexts/          # React contexts (Auth)
│   ├── lib/               # Supabase client and types
│   ├── pages/             # Main application pages
│   │   ├── AdminDashboard.tsx
│   │   ├── InvestorDashboard.tsx
│   │   ├── ProjectDetailPage.tsx
│   │   └── ProjectsPage.tsx
│   └── App.tsx            # Main app component with routing
├── setup-database.sql     # Database initialization script
└── README.md              # This file
```

## Key Features Explained

### Real-Time Weekly Updates
Projects can have weekly progress updates with:
- Week number
- Title and description
- Optional image URLs
- Timeline visualization

### Investment Tracking
- Total amount invested
- Expected returns
- Active investment count
- Individual investment details

### Security
- Row Level Security (RLS) on all tables
- Users can only see/modify their own data
- Admins have special permissions for project management
- Secure authentication via Supabase Auth

### Filtering & Search
- Search by project name, location, or category
- Filter by country
- Filter by category (Poultry, Maize, Greenhouse, Aquaculture)
- Sort by ROI, funding progress, or duration

## Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

## Troubleshooting

### "Missing Supabase environment variables" error
- Make sure the `.env` file exists with both variables
- Restart the dev server after any `.env` changes

### "relation does not exist" or can't see projects
- You need to run the database setup script (`setup-database.sql`)
- Follow the Database Setup instructions above

### Can't access Admin Dashboard
- Regular users see "Investor Dashboard"
- To become admin, update your role in the database:
  ```sql
  UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
  ```

## Support

For issues or questions about FarmVora, please check the setup instructions or refer to the Supabase documentation.

## License

This project is created for educational and demonstration purposes.
