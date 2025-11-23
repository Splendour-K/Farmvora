# Investment Bug Fixes

## Changes Made

### 1. Updated Database Types (`src/lib/database.types.ts`)
- Added missing columns to investments table:
  - `reviewed_by`
  - `reviewed_at`
  - `rejection_reason`

### 2. Enhanced Error Handling (`src/pages/ProjectDetailPage.tsx`)
- Added comprehensive console logging for investment creation
- Added `.select()` to get created investment data back
- Improved error messages to show specific error details
- Made `loadProjectDetails()` async and awaited after investment creation

### 3. Added Debug Logging
- Investment creation logs what data is being sent
- Investment loading logs what data is received
- Button state computation is logged to console
- Admin panel logs pending investments being loaded

## How to Test

### Step 1: Open Browser Console
1. Open Chrome DevTools (F12)
2. Go to the Console tab
3. Clear any existing logs

### Step 2: Test Investment Creation
1. Login as a regular user (not admin)
2. Navigate to any active project
3. Click "Invest Now"
4. Enter an amount (e.g., 1000)
5. Click "Submit for Approval"
6. **Watch the console** for these logs:
   ```
   Attempting to create investment: { investor_id: ..., project_id: ..., amount: 1000, ... }
   Investment created successfully: [...]
   Loading investments for user: ...
   User investments loaded: [...]
   ```

### Step 3: Verify Pending Status
1. After submitting, the modal should close
2. The page should refresh investment data
3. You should see "Investment Pending" badge (orange) with the amount
4. The "Invest Now" button should be hidden
5. **Check console** for:
   ```
   Button display state: {
     pendingInvestment: { id: ..., amount: 1000, status: 'pending' },
     ...
   }
   ```

### Step 4: Check Admin Panel
1. Logout and login as admin
2. Go to Admin Dashboard
3. Click on "Investment Approvals" tab
4. **Check console** for:
   ```
   Loading pending investments...
   Pending investments loaded: [...]
   ```
5. You should see your investment in the list

## Common Issues and Solutions

### Issue 1: Investment not created
**Symptoms:** Error in console like "RLS policy violation"
**Solution:** Check that:
- User is logged in (`user.id` exists)
- Project exists (`project.id` is valid)
- User has proper role in profiles table

### Issue 2: Investment created but not showing
**Symptoms:** Console shows "Investment created successfully" but list is empty
**Solution:** Check that:
- The investment has `investor_id` matching current user
- The investment has correct `project_id`
- RLS policies allow user to read their own investments

### Issue 3: Admin can't see investments
**Symptoms:** Admin panel shows no pending investments
**Solution:** Check that:
- Admin user has `role = 'admin'` in profiles table
- There are actually investments with `status = 'pending'`
- RLS policies allow admin to read all investments

## Database Checks

Run these queries in Supabase SQL Editor:

```sql
-- Check if investment was created
SELECT * FROM investments 
WHERE status = 'pending' 
ORDER BY invested_at DESC 
LIMIT 5;

-- Check user profile
SELECT id, email, role FROM profiles 
WHERE email = 'your-email@example.com';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'investments';
```

## Next Steps

1. Test investment creation with console open
2. Share console logs if issue persists
3. Run database checks above
4. Verify RLS policies are correct
