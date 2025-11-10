# Vanna AI Service Deployment Guide

## What is VANNA_API_BASE_URL?

The `VANNA_API_BASE_URL` is the URL of your **Vanna AI service** (Python/FastAPI). This service powers the "Chat with Data" feature.

**Important**: 
- The **dashboard** will work **without** this (you can skip it for now)
- Only the **"Chat with Data"** feature needs it
- You can deploy it later when you want to test the chat feature

## Where to Deploy Vanna AI Service

Vercel doesn't support Python well, so deploy to one of these platforms:

### Option 1: Render (Recommended - Free Tier)

1. **Go to Render**: https://render.com
2. **Sign up/Login** (free account works)
3. **Click "New +" → "Web Service"**
4. **Connect your GitHub repository**: `Shiva70199/Flowbit-Analytics`
5. **Configure**:
   - **Name**: `flowbit-vanna-ai` (or any name)
   - **Root Directory**: `services/vanna`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

6. **Environment Variables** (Add these):
   ```
   GROQ_API_KEY=your_groq_api_key_here
   DB_USER=postgres_user
   DB_PASSWORD=your_database_password
   DB_HOST=your_database_host
   DB_PORT=5432
   DB_NAME=flowbit_db
   ```

7. **Click "Create Web Service"**

8. **After deployment**, you'll get a URL like:
   - `https://flowbit-vanna-ai.onrender.com`
   - **This is your VANNA_API_BASE_URL!**

### Option 2: Railway (Also Free Tier)

1. **Go to Railway**: https://railway.app
2. **Sign up/Login**
3. **Click "New Project" → "Deploy from GitHub repo"**
4. **Select your repository**
5. **Configure**:
   - **Root Directory**: `services/vanna`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

6. **Add Environment Variables** (same as Render)

7. **After deployment**, you'll get a URL like:
   - `https://flowbit-vanna-ai.up.railway.app`
   - **This is your VANNA_API_BASE_URL!**

### Option 3: Fly.io (Free Tier)

1. **Go to Fly.io**: https://fly.io
2. **Install Fly CLI**: `curl -L https://fly.io/install.sh | sh`
3. **Login**: `fly auth login`
4. **Deploy**:
   ```bash
   cd services/vanna
   fly launch
   ```
5. Follow the prompts and you'll get a URL

## How to Use VANNA_API_BASE_URL

### Step 1: Get Your Vanna Service URL

After deploying to Render/Railway, you'll get a URL like:
- `https://flowbit-vanna-ai.onrender.com`
- `https://flowbit-vanna-ai.up.railway.app`

### Step 2: Set It in Backend API

In your **backend Vercel project** (the one you deployed for `apps/api`):

1. Go to **Vercel Dashboard** → Your backend project
2. **Settings → Environment Variables**
3. Add:
   ```
   VANNA_API_BASE_URL=https://your-vanna-service-url.onrender.com
   ```
   (Use your actual Vanna service URL)

4. **Redeploy** the backend

### Step 3: Test

1. Go to your frontend: `https://flowbit-analytics-indol.vercel.app/chat`
2. Try asking: "What's the total spend?"
3. It should work! 🎉

## For Local Development

If testing locally, use:
```
VANNA_API_BASE_URL=http://localhost:8000
```

## Important Notes

### Database Connection

The Vanna service needs to connect to the **same PostgreSQL database** as your backend API. Make sure:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` match your database
- The database is accessible from Render/Railway (not just localhost)

### Groq API Key

You need a Groq API key:
1. Go to: https://console.groq.com
2. Sign up/login
3. Create an API key
4. Add it as `GROQ_API_KEY` in your Vanna service environment variables

### Testing the Vanna Service

After deployment, test it directly:
```bash
curl -X POST https://your-vanna-service.onrender.com/vanna/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "What is the total spend?"}'
```

## Summary

- **VANNA_API_BASE_URL** = URL of your deployed Vanna AI service
- **Deploy to**: Render, Railway, or Fly.io (not Vercel)
- **Set in**: Backend API environment variables
- **Optional**: Dashboard works without it, only Chat with Data needs it

## Quick Checklist

- [ ] Deploy Vanna service to Render/Railway
- [ ] Get the service URL
- [ ] Add `VANNA_API_BASE_URL` to backend Vercel project
- [ ] Add `GROQ_API_KEY` to Vanna service
- [ ] Add database credentials to Vanna service
- [ ] Test Chat with Data feature

