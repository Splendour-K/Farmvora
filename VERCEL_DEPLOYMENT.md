# Vercel Deployment Guide

## Prerequisites
- GitHub repository: https://github.com/Splendour-K/Farmvora
- Vercel account connected to GitHub

## Deployment Steps

### 1. Import Project to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click "Import Project"
3. Select your GitHub repository: `Splendour-K/Farmvora`
4. Click "Import"

### 2. Configure Build Settings
Vercel should auto-detect these settings:
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 3. Add Environment Variables
In the Vercel project settings, add these environment variables:

```
VITE_SUPABASE_URL=https://jqxpyaixoqtbpxslqfdc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeHB5YWl4b3F0YnB4c2xxZmRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4OTA0OTMsImV4cCI6MjA3OTQ2NjQ5M30.dYhRpn1uruLEB8oXCa7lhfsWQRvHRxT0Z5htAjJoPN0
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key_here
```

**How to add:**
1. In Vercel project settings, go to "Environment Variables"
2. Add each variable for all environments (Production, Preview, Development)
3. Click "Save"

### 4. Deploy
1. Click "Deploy"
2. Wait for build to complete (usually 1-2 minutes)
3. Your site will be live at `https://your-project.vercel.app`

### 5. Post-Deployment Configuration

#### Update Supabase URL Authentication
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/jqxpyaixoqtbpxslqfdc/settings/auth)
2. Under "Site URL", add your Vercel URL: `https://your-project.vercel.app`
3. Under "Redirect URLs", add:
   - `https://your-project.vercel.app/auth/callback`
   - `https://your-project.vercel.app/**` (wildcard)

#### Test Your Deployment
1. Visit your Vercel URL
2. Test user signup/login
3. Test investment creation/approval
4. Verify realtime updates work
5. Test admin dashboard features

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify all environment variables are set correctly
- Ensure `package.json` has all dependencies

### Authentication Issues
- Verify Supabase URL and anon key are correct
- Check Supabase redirect URLs include your Vercel domain
- Clear browser cache and cookies

### Database Connection Issues
- Confirm migrations were applied: `npx supabase db push`
- Verify RLS policies are enabled in Supabase
- Check Supabase project is not paused

## Automatic Deployments
Every push to `main` branch will automatically trigger a new deployment on Vercel.

## Custom Domain (Optional)
1. In Vercel project settings, go to "Domains"
2. Add your custom domain
3. Update DNS records as instructed
4. Update Supabase redirect URLs with custom domain

## Production Checklist
- ✅ All migrations applied to Supabase
- ✅ Environment variables configured
- ✅ Supabase redirect URLs updated
- ✅ React Router navigation working
- ✅ Investment rejection system functional
- ✅ Realtime subscriptions active
- ⏳ Add Paystack public key (for payments)
- ⏳ Test all features in production
- ⏳ Set up custom domain (optional)

## Support
For issues, check:
- Vercel build logs
- Supabase logs: https://supabase.com/dashboard/project/jqxpyaixoqtbpxslqfdc/logs/explorer
- Browser console for frontend errors
