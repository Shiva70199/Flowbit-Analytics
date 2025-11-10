Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Flowbit Analytics - Service Test" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$allGood = $true

# Test Web App
Write-Host "1. Testing Web App (port 3000)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✓ Web App is running (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Web App is not responding" -ForegroundColor Red
    Write-Host "     Error: $($_.Exception.Message)" -ForegroundColor Gray
    $allGood = $false
}

# Test Express API
Write-Host "`n2. Testing Express API (port 3001)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/summary" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✓ Express API is running (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Express API is not responding" -ForegroundColor Red
    Write-Host "     Error: $($_.Exception.Message)" -ForegroundColor Gray
    $allGood = $false
}

# Test Vanna AI Status
Write-Host "`n3. Testing Vanna AI Service (port 8000)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/status" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    $json = $response.Content | ConvertFrom-Json
    Write-Host "   ✓ Vanna AI is running" -ForegroundColor Green
    Write-Host "     Status: $($json.status)" -ForegroundColor Gray
    Write-Host "     Model: $($json.model)" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Vanna AI is not responding" -ForegroundColor Red
    Write-Host "     Error: $($_.Exception.Message)" -ForegroundColor Gray
    $allGood = $false
}

# Test Vanna AI Query Endpoint
Write-Host "`n4. Testing Vanna AI Query Endpoint..." -ForegroundColor Yellow
try {
    $body = @{
        query = "List top 3 vendors by spend"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:8000/vanna/ask" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -UseBasicParsing `
        -TimeoutSec 30 `
        -ErrorAction Stop
    
    $result = $response.Content | ConvertFrom-Json
    Write-Host "   ✓ Vanna AI query endpoint is working" -ForegroundColor Green
    Write-Host "     SQL Generated: $($result.sql.Substring(0, [Math]::Min(50, $result.sql.Length)))..." -ForegroundColor Gray
    Write-Host "     Results: $($result.results.Count) rows" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Vanna AI query endpoint failed" -ForegroundColor Red
    Write-Host "     Error: $($_.Exception.Message)" -ForegroundColor Gray
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "     Response: $responseBody" -ForegroundColor Gray
    }
    $allGood = $false
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "  ✓ All services are running!" -ForegroundColor Green
    Write-Host "`n  Access points:" -ForegroundColor Cyan
    Write-Host "  • Web App:    http://localhost:3000" -ForegroundColor White
    Write-Host "  • Express API: http://localhost:3001" -ForegroundColor White
    Write-Host "  • Vanna AI:   http://localhost:8000" -ForegroundColor White
    Write-Host "  • Vanna Docs: http://localhost:8000/docs" -ForegroundColor White
} else {
    Write-Host "  ✗ Some services are not running" -ForegroundColor Red
    Write-Host "  Check the errors above and verify:" -ForegroundColor Yellow
    Write-Host "  • Run 'npm run dev' to start all services" -ForegroundColor White
    Write-Host "  • Check PostgreSQL is running" -ForegroundColor White
    Write-Host "  • Verify GROQ_API_KEY in apps/api/.env" -ForegroundColor White
}
Write-Host "========================================`n" -ForegroundColor Cyan

