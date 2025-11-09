# Fix Vercel Deployment - UI Not Showing

## Problem
The UI works locally but doesn't show correctly on Vercel.

## Solution: Set Root Directory in Vercel Dashboard

### Step-by-Step Instructions:

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Sign in with GitHub

2. **Select Your Project**
   - Click on your project: `Flowbit-Analytics` or `flowbit-analytics`

3. **Go to Settings**
   - Click on "Settings" tab
   - Scroll down to "General" section

4. **Set Root Directory** ⚠️ **CRITICAL STEP**
   - Find "Root Directory" setting
   - Click "Edit"
   - Enter: `apps/web`
   - Click "Save"

5. **Redeploy**
   - Go to "Deployments" tab
   - Click the three dots (⋯) on the latest deployment
   - Click "Redeploy"
   - Or push a new commit to trigger redeploy

## Alternative: Delete and Re-import Project

If the above doesn't work:

1. **Delete Current Project**
   - Go to Project Settings
   - Scroll to bottom
   - Click "Delete Project"

2. **Re-import Project**
   - Click "Add New Project"
   - Select repository: `Shiva70199/Flowbit-Analytics`
   - Click "Import"

3. **Configure During Import**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `apps/web` ⚠️ **SET THIS**
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

## Verify Configuration

After deployment, check:

1. **Build Logs**
   - Go to "Deployments" tab
   - Click on latest deployment
   - Check "Build Logs"
   - Should show: "Building in apps/web"

2. **Check URL**
   - Visit your Vercel URL
   - Should show the dashboard UI

## Common Issues

### Issue: "Cannot find module"
- **Solution**: Root Directory not set correctly
- **Fix**: Set Root Directory to `apps/web` in Settings

### Issue: "Build failed"
- **Solution**: Check Node.js version
- **Fix**: Set Node.js version to 18+ in Project Settings → General

### Issue: "Page not found"
- **Solution**: Root Directory not set
- **Fix**: Set Root Directory to `apps/web`

## Current Configuration

✅ **Fixed Files:**
- `apps/web/next.config.js` - Removed `output: 'standalone'`
- `vercel.json` - Simplified configuration
- `apps/web/vercel.json` - App-specific config

✅ **Ready to Deploy:**
- All files committed and pushed to GitHub
- Configuration files updated
- UI styling enhanced

## Next Steps

1. Set Root Directory to `apps/web` in Vercel Dashboard
2. Redeploy the project
3. Check the deployment URL
4. UI should now match the Figma design

