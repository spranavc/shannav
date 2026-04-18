# Starts backend and frontend dev servers in separate windows

$root = $PSScriptRoot

# Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "
  cd '$root';
  .venv\Scripts\activate;
  uvicorn backend.main:app --reload
"

# Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "
  cd '$root\frontend';
  npm run dev
"

Write-Host "Starting servers..."
Write-Host "  Backend:  http://localhost:8000"
Write-Host "  Frontend: http://localhost:5173"
