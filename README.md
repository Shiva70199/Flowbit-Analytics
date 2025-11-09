# Flowbit Analytics Dashboard

A production-grade full-stack analytics dashboard with AI-powered natural language querying.

## Project Structure

```
flowbit-analytics/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Express.js backend
├── services/
│   └── vanna/        # Python FastAPI service for AI queries
└── data/
    └── Analytics_Test_Data.json
```

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Recharts
- Lucide React Icons

### Backend
- Node.js + Express.js
- TypeScript
- Prisma ORM
- PostgreSQL

### AI Service
- Python FastAPI
- Vanna AI
- Groq LLM
- ChromaDB

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL
- Docker (for PostgreSQL)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Shiva70199/Flowbit-Analytics.git
cd flowbit-analytics
```

2. Install dependencies:
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd apps/web
npm install

# Install backend dependencies
cd ../api
npm install

# Install Python dependencies
cd ../../services/vanna
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

3. Set up environment variables:
- Copy `.env.example` to `.env` in `apps/api/`
- Add your database credentials and API keys

4. Set up database:
```bash
cd apps/api
npx prisma migrate dev
npx prisma db seed
```

5. Train Vanna AI:
```bash
cd services/vanna
python vanna_setup.py
```

6. Start services:
```bash
# Terminal 1: Backend API
cd apps/api
npm run dev:api

# Terminal 2: Vanna AI Service
cd services/vanna
python -m uvicorn main:app --reload --port 8000

# Terminal 3: Frontend
cd apps/web
npm run dev:web
```

## Deployment

### Vercel (Frontend + Backend)

1. **Deploy Frontend:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import repository: `Shiva70199/Flowbit-Analytics`
   - **IMPORTANT**: Set Root Directory to `apps/web`
   - Framework: Next.js (auto-detected)
   - Deploy

2. **Deploy Backend:**
   - Create another Vercel project
   - Root Directory: `apps/api`
   - Framework: Other
   - Add environment variables

### Vanna AI Service

Deploy to Render or Railway:
- See `DEPLOYMENT_GUIDE.md` for detailed instructions

## Environment Variables

### Frontend (`apps/web/.env.local`)
```
NEXT_PUBLIC_API_URL=https://your-api.vercel.app
```

### Backend (`apps/api/.env`)
```
DATABASE_URL=postgresql://user:password@host:5432/dbname
VANNA_API_BASE_URL=https://your-vanna-service.onrender.com
```

### Vanna AI (`services/vanna/.env`)
```
GROQ_API_KEY=your_groq_api_key
DB_USER=postgres_user
DB_PASSWORD=your_password
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=flowbit_db
```

## Features

- 📊 Interactive Analytics Dashboard
- 📈 Real-time Charts and Visualizations
- 🤖 AI-Powered Natural Language Queries
- 🔍 Advanced Search and Filtering
- 📱 Responsive Design

## License

Private - Flowbit Analytics Project

