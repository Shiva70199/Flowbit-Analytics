# Deployment Guide for Flowbit Analytics

## Git Repository
✅ **Repository**: https://github.com/Shiva70199/Flowbit-Analytics.git
✅ **Branch**: main
✅ **Status**: Pushed successfully

## Vercel Deployment Instructions

### Prerequisites
1. Vercel account (sign up at https://vercel.com)
2. GitHub account connected to Vercel

### Step 1: Deploy Frontend (Next.js)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository: `Shiva70199/Flowbit-Analytics`
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

5. **Environment Variables** (Add these in Vercel dashboard):
   ```
   NODE_ENV=production
   ```

6. Click "Deploy"

### Step 2: Deploy Backend API (Express.js)

**Option A: Deploy as separate Vercel project**
1. Create another project in Vercel
2. Use the same repository
3. Configure:
   - **Root Directory**: `apps/api`
   - **Framework Preset**: Other
   - **Build Command**: `npm install`
   - **Output Directory**: (leave empty)
   - **Install Command**: `npm install`

4. **Environment Variables**:
   ```
   DATABASE_URL=your_postgres_connection_string
   VANNA_API_BASE_URL=your_vanna_service_url
   NODE_ENV=production
   ```

**Option B: Deploy as API routes in Next.js project**
- The backend can be deployed as API routes in the Next.js app
- Update `apps/web/app/api/` to proxy to your Express server

### Step 3: Deploy Vanna AI Service

The Vanna AI service (Python/FastAPI) needs to be deployed separately as Vercel doesn't support Python runtimes well. Recommended platforms:

1. **Render** (Recommended):
   - Go to https://render.com
   - Create a new Web Service
   - Connect your GitHub repo
   - Root Directory: `services/vanna`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Environment Variables:
     ```
     GROQ_API_KEY=your_groq_api_key
     DB_USER=postgres_user
     DB_PASSWORD=your_password
     DB_HOST=your_db_host
     DB_PORT=5432
     DB_NAME=flowbit_db
     ```

2. **Railway**:
   - Similar setup to Render
   - Supports Python natively

3. **Heroku**:
   - Traditional option, requires Procfile

### Step 4: Update Environment Variables

After deploying all services, update the frontend environment variables:

1. In Vercel (Frontend project):
   ```
   NEXT_PUBLIC_API_URL=https://your-api.vercel.app
   NEXT_PUBLIC_VANNA_URL=https://your-vanna-service.onrender.com
   ```

2. In Vercel (Backend project):
   ```
   VANNA_API_BASE_URL=https://your-vanna-service.onrender.com
   DATABASE_URL=your_postgres_connection_string
   ```

### Step 5: Database Setup

1. Set up PostgreSQL database (recommended: Supabase, Neon, or Railway)
2. Run migrations:
   ```bash
   cd apps/api
   npx prisma migrate deploy
   npx prisma db seed
   ```

### Quick Deploy Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd apps/web
vercel

# Deploy backend
cd apps/api
vercel
```

## Post-Deployment Checklist

- [ ] Frontend deployed and accessible
- [ ] Backend API deployed and accessible
- [ ] Vanna AI service deployed and accessible
- [ ] Database connected and migrations run
- [ ] Environment variables configured
- [ ] CORS settings updated for production URLs
- [ ] Test all API endpoints
- [ ] Test Chat with Data feature

## Troubleshooting

1. **Build fails**: Check Node.js version (should be 18+)
2. **API not working**: Verify environment variables
3. **CORS errors**: Update CORS settings in `apps/api/src/server.ts`
4. **Database connection**: Verify DATABASE_URL format

## Notes

- The frontend and backend can be deployed as separate Vercel projects
- Vanna AI must be deployed on a Python-compatible platform
- Update API URLs in frontend code for production

