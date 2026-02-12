# Supabase Setup Guide for Carbon Tracker

## Quick Setup Steps

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in your project details:
   - **Name**: Carbon Tracker
   - **Database Password**: (create a strong password and save it securely)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free tier is perfect for development
4. Click "Create new project" and wait ~2 minutes for setup

### 2. Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql` from this project
4. Paste it into the SQL Editor
5. Click **Run** (or press Ctrl/Cmd + Enter)
6. You should see "Success. No rows returned" - this is correct!

### 3. Get Your API Keys

1. In your Supabase dashboard, go to **Settings** (gear icon in sidebar)
2. Click on **API** in the settings menu
3. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

### 4. Update Your Environment Variables

1. Open the `.env` file in your project root
2. Replace the placeholder values:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
3. Save the file

### 5. Enable Email Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Email** and make sure it's enabled
3. (Optional) Configure email templates under **Authentication** → **Email Templates**

### 6. Test Your Connection

Restart your development server:
```bash
npm run dev
```

The app should now be connected to Supabase!

## Database Schema Overview

Your database now includes:

### Tables:
- **profiles** - User profiles (extends Supabase auth)
- **admin_facility_data** - Admin inputs for facility carbon data
- **student_survey_responses** - Student survey submissions
- **carbon_footprint_history** - Historical tracking of carbon footprints
- **carbon_reduction_goals** - User goals for carbon reduction

### Security:
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Admins have additional permissions to view aggregated data

## Next Steps

Now that Supabase is set up, you can:

1. **Add Authentication** - Implement signup/login in your app
2. **Connect AdminInput** page to save data to `admin_facility_data` table
3. **Connect StudentSurvey** page to save data to `student_survey_responses` table
4. **Build Dashboard** to visualize data from the database
5. **Build History** page to show `carbon_footprint_history`

## Useful Resources

- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## Testing Your Database

You can test your database in the Supabase dashboard:

1. Go to **Table Editor** (left sidebar)
2. You'll see all your tables
3. Click any table to view/edit data
4. Use this to manually add test data

## Troubleshooting

**Can't connect?**
- Make sure your `.env` file has the correct values
- Restart your dev server after changing `.env`
- Check that the values don't have quotes or extra spaces

**SQL errors when running schema?**
- Make sure you copied the entire `supabase-schema.sql` file
- Try running it in sections if there are errors
- Check the error message for specific line numbers

**Authentication not working?**
- Verify Email provider is enabled in Authentication settings
- Check that your ANON key is correct in `.env`
