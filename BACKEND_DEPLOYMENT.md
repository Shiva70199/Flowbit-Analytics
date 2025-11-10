# Backend API Deployment Guide

## Quick Steps to Deploy Backend to Vercel

Your frontend is deployed at: **https://flowbit-analytics-indol.vercel.app/**

Now you need to deploy the backend API so data can load.

### Step 1: Deploy Backend API to Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click "Add New Project"**
3. **Import the same repository**: `Shiva70199/Flowbit-Analytics`
4. **Configure the project**:
   - **Project Name**: `flowbit-analytics-api` (or any name you prefer)
   - **Framework Preset**: **Other**
   - **Root Directory**: `apps/api` ⚠️ **IMPORTANT**
   - **Build Command**: `npm install` (or leave empty)
   - **Output Directory**: (leave empty)
   - **Install Command**: `npm install`

5. **Environment Variables** (Add these):
   ```
   DATABASE_URL=your_postgresql_connection_string
   VANNA_API_BASE_URL=http://localhost:8000
   NODE_ENV=production
   ```

6. **Click "Deploy"**

### Step 2: Get Your Backend API URL

After deployment, Vercel will give you a URL like:
- `https://flowbit-analytics-api-xyz.vercel.app`
- Or `https://flowbit-analytics-api.vercel.app`

**This is your API URL!**

### Step 3: Update Frontend Environment Variables

1. Go back to your **frontend project** in Vercel (the one at `flowbit-analytics-indol`)
2. Go to **Settings → Environment Variables**
3. Add:
   ```
   API_URL=https://your-backend-api-url.vercel.app
   ```
   (Replace with your actual backend URL from Step 2)

4. **Redeploy** the frontend (or it will auto-redeploy)

### Step 4: Test

Visit: https://flowbit-analytics-indol.vercel.app/

The data should now load! 🎉

## Important Notes

### Database Setup

You need a PostgreSQL database. Options:
- **Supabase** (Free tier): https://supabase.com
- **Neon** (Free tier): https://neon.tech
- **Railway** (Free tier): https://railway.app

After creating a database:
1. Get the connection string (looks like: `postgresql://user:password@host:5432/dbname`)
2. Add it as `DATABASE_URL` in backend Vercel project
3. Run Prisma migrations:
   ```bash
   cd apps/api
   npx prisma migrate deploy
   npx prisma db seed
   ```

### Vanna AI Service

For the "Chat with Data" feature to work, you also need to deploy the Vanna AI service to Render/Railway. But the dashboard will work without it.

## Troubleshooting

### If backend deployment fails:
- Check that Root Directory is `apps/api`
- Verify `package.json` exists in `apps/api/`
- Check build logs for errors

### If data still doesn't load:
- Verify `API_URL` is set correctly in frontend project
- Check browser console for errors
- Verify backend URL is accessible (try opening it in browser)
- Check CORS settings (should allow all origins)

### If you see database errors:
- Verify `DATABASE_URL` is correct
- Check database is accessible from Vercel
- Run Prisma migrations

