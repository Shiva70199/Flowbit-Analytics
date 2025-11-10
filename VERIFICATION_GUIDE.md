# Verification Guide - Flowbit Analytics

This guide helps you verify that all services are running successfully.

## Services Overview

Your application has **3 main services**:

1. **Next.js Web App** - Port `3000`
2. **Express API** - Port `3001`  
3. **Vanna AI Service** - Port `8000`

## Quick Verification Steps

### 1. Check Service Status in Terminal

When you run `npm run dev`, you should see:

```
✓ Next.js running on http://localhost:3000
✓ Express API running on http://localhost:3001
✓ Vanna AI running on http://0.0.0.0:8000
```

### 2. Test Each Service

#### **A. Web App (Next.js) - Port 3000**

Open in browser:
```
http://localhost:3000
```

**Expected:** Dashboard with analytics charts and data

**Test via curl:**
```powershell
curl http://localhost:3000
```

---

#### **B. Express API - Port 3001**

**Test status endpoint:**
```powershell
curl http://localhost:3001/api/health
```

**Test data endpoints:**
```powershell
# Get invoices
curl http://localhost:3001/api/invoices

# Get vendors
curl http://localhost:3001/api/vendors

# Get summary stats
curl http://localhost:3001/api/summary
```

**Expected:** JSON responses with data

---

#### **C. Vanna AI Service - Port 8000**

**Test status endpoint:**
```powershell
curl http://localhost:8000/status
```

**Expected Response:**
```json
{
  "status": "Vanna AI Service Operational",
  "model": "flowbit_vanna_model"
}
```

**Test SQL generation endpoint:**
```powershell
curl -X POST http://localhost:8000/vanna/ask `
  -H "Content-Type: application/json" `
  -d '{\"query\": \"List top 3 vendors by spend\"}'
```

**Expected Response:**
```json
{
  "sql": "SELECT v.name, SUM(i.invoice_total) AS total_spend...",
  "results": [...],
  "message": "Query successful"
}
```

**Interactive API Docs:**
Open in browser:
```
http://localhost:8000/docs
```

This shows FastAPI's Swagger UI where you can test endpoints interactively.

---

## Complete Verification Checklist

### ✅ Prerequisites
- [ ] PostgreSQL database is running on `localhost:5432`
- [ ] Database `flowbit_db` exists
- [ ] Tables `invoices`, `vendors`, `customers`, etc. exist
- [ ] `GROQ_API_KEY` is set in `apps/api/.env`

### ✅ Services Running
- [ ] Web app accessible at `http://localhost:3000`
- [ ] Express API responding at `http://localhost:3001`
- [ ] Vanna AI service responding at `http://localhost:8000`

### ✅ Vanna AI Setup
- [ ] Vanna model trained (run `python services/vanna/vanna_setup.py`)
- [ ] ChromaDB database created at `services/vanna/flowbit_vanna_model.sqlite`
- [ ] Vanna can connect to PostgreSQL
- [ ] Vanna can generate SQL queries

### ✅ End-to-End Test

**Test the full flow:**

1. **Open web app:** `http://localhost:3000`
2. **Try a natural language query** (if chat interface exists)
3. **Check Vanna API logs** for SQL generation
4. **Verify results** are returned correctly

---

## Troubleshooting

### If Vanna Service Fails:

1. **Check Groq API Key:**
   ```powershell
   # Verify .env file exists
   cat apps/api/.env
   ```

2. **Check Vanna Model:**
   ```powershell
   # Verify model file exists
   ls services/vanna/flowbit_vanna_model.sqlite
   ```

3. **Re-train Vanna:**
   ```powershell
   cd services/vanna
   .\venv\Scripts\python.exe vanna_setup.py
   ```

### If Database Connection Fails:

1. **Check PostgreSQL is running:**
   ```powershell
   # Test connection
   psql -h localhost -U postgres_user -d flowbit_db
   ```

2. **Verify credentials** in `vanna_setup.py` match your database

### If Ports are Already in Use:

1. **Find process using port:**
   ```powershell
   # For port 3000
   netstat -ano | findstr :3000
   
   # For port 8000
   netstat -ano | findstr :8000
   ```

2. **Kill process** or change port in configuration

---

## Quick Test Script

Save this as `test-services.ps1`:

```powershell
Write-Host "Testing Flowbit Analytics Services..." -ForegroundColor Cyan

# Test Web App
Write-Host "`n1. Testing Web App (port 3000)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
    Write-Host "   ✓ Web App is running" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Web App is not responding" -ForegroundColor Red
}

# Test Express API
Write-Host "`n2. Testing Express API (port 3001)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/summary" -UseBasicParsing -TimeoutSec 5
    Write-Host "   ✓ Express API is running" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Express API is not responding" -ForegroundColor Red
}

# Test Vanna AI
Write-Host "`n3. Testing Vanna AI Service (port 8000)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/status" -UseBasicParsing -TimeoutSec 5
    $json = $response.Content | ConvertFrom-Json
    Write-Host "   ✓ Vanna AI is running" -ForegroundColor Green
    Write-Host "   Model: $($json.model)" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Vanna AI is not responding" -ForegroundColor Red
}

Write-Host "`nTest complete!" -ForegroundColor Cyan
```

Run it:
```powershell
.\test-services.ps1
```

---

## Success Indicators

You'll know everything is working when:

✅ All three services start without errors  
✅ Web app loads with dashboard  
✅ API endpoints return data  
✅ Vanna AI generates SQL from natural language  
✅ No errors in terminal output  
✅ FastAPI docs accessible at `/docs`

---

## Next Steps

Once verified, you can:
- Use the web interface to query data
- Test natural language queries via Vanna API
- Check FastAPI interactive docs at `http://localhost:8000/docs`
- Monitor logs for any issues

