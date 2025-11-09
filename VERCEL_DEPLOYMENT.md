# Vercel Deployment Instructions

## Quick Deploy Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Sign in with GitHub

2. **Import Project**
   - Click "Add New Project"
   - Select repository: `Shiva70199/Flowbit-Analytics`
   - Click "Import"

3. **Configure Project Settings**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `apps/web` ⚠️ **IMPORTANT**
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. **Environment Variables** (Optional for now)
   ```
   NEXT_PUBLIC_API_URL=https://your-api-url.vercel.app
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Navigate to web app
cd apps/web

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (Select your account)
# - Link to existing project? No
# - Project name? flowbit-analytics-web
# - Directory? ./
# - Override settings? No
```

## Important Configuration

The project is configured with:
- **Root Directory**: `apps/web` (set in Vercel dashboard)
- **Framework**: Next.js 14
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

## Troubleshooting

### If deployment fails:

1. **Check Root Directory**
   - Must be set to `apps/web` in Vercel project settings
   - Go to Project Settings → General → Root Directory

2. **Check Build Logs**
   - View build logs in Vercel dashboard
   - Common issues:
     - Missing dependencies (check package.json)
     - TypeScript errors
     - Missing environment variables

3. **Verify Files**
   - Ensure `next.config.js` exists in `apps/web/`
   - Ensure `package.json` has build script

### Common Issues:

**Issue**: "Cannot find module"
- **Solution**: Ensure `node_modules` is not in `.gitignore` for deployment (Vercel installs it)

**Issue**: "Build failed"
- **Solution**: Check Node.js version (should be 18+)
- Set in Vercel: Project Settings → General → Node.js Version

**Issue**: "Page not found"
- **Solution**: Verify `apps/web` is set as root directory

## Post-Deployment

After successful deployment:

1. **Get your deployment URL**
   - Example: `https://flowbit-analytics-web.vercel.app`

2. **Update API URLs** (if needed)
   - Update `NEXT_PUBLIC_API_URL` in Vercel environment variables
   - Or update hardcoded URLs in code

3. **Test the deployment**
   - Visit your Vercel URL
   - Test all pages and features

## Next Steps

1. Deploy backend API separately (or as API routes)
2. Deploy Vanna AI service (Render/Railway)
3. Update environment variables
4. Configure custom domain (optional)

