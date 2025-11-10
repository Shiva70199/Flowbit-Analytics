# Vercel Deployment Fix Guide

## Issues Fixed

### 1. UI Not Loading (Figma Design)
- ✅ Added `important: true` to Tailwind config to ensure styles override
- ✅ Created Next.js API routes to proxy backend requests
- ✅ Updated frontend to use relative API paths (`/api/*`)

### 2. No Values Showing
- ✅ Created API proxy routes in `apps/web/app/api/`
- ✅ Updated environment variable handling
- ✅ Fixed API endpoint paths in frontend components

## Required Vercel Environment Variables

In your Vercel project settings, add these environment variables:

### For Frontend (Next.js App)
```
API_URL=https://your-backend-api.vercel.app
```

**OR** if your backend is deployed separately:
```
NEXT_PUBLIC_API_URL=https://your-backend-api.vercel.app
```

### Important Notes

1. **Root Directory**: Make sure in Vercel project settings, the Root Directory is set to `apps/web`

2. **Build Command**: Should be `npm run build` (runs from `apps/web` directory)

3. **Backend Deployment**: 
   - Option A: Deploy backend as separate Vercel project (recommended)
   - Option B: Use the API routes we created (they proxy to your backend)

## Deployment Steps

1. **Push changes to Git**:
   ```bash
   git add .
   git commit -m "Fix Vercel deployment: Add API routes and fix UI"
   git push
   ```

2. **In Vercel Dashboard**:
   - Go to your project settings
   - Verify Root Directory is `apps/web`
   - Add environment variable `API_URL` with your backend URL
   - Redeploy

3. **If Backend is Separate**:
   - Deploy backend API as separate Vercel project
   - Set Root Directory to `apps/api`
   - Add environment variables:
     - `DATABASE_URL`
     - `VANNA_API_BASE_URL`
   - Update frontend `API_URL` to point to backend URL

## Testing

After deployment:
1. Check browser console for errors
2. Verify API calls are going to `/api/*` routes
3. Check Network tab to see if data is loading
4. Verify Tailwind styles are applied (check computed styles)

## Troubleshooting

### If UI still doesn't match Figma:
- Check browser console for CSS errors
- Verify Tailwind is compiling (check build logs)
- Clear browser cache and hard refresh (Ctrl+Shift+R)

### If no data is showing:
- Check Network tab in browser DevTools
- Verify `API_URL` environment variable is set correctly
- Check backend API is accessible and returning data
- Verify CORS is enabled on backend

### If build fails:
- Check Root Directory is `apps/web`
- Verify `package.json` exists in `apps/web/`
- Check build logs for specific errors

