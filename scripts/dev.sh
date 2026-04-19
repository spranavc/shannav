#!/bin/bash
# Start backend and frontend dev servers

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PID_FILE="$ROOT/.dev-pids"

echo ""
echo "Starting Shannav dev servers..."

# Activate venv and start backend in background
cd "$ROOT"
source .venv/Scripts/activate
uvicorn backend.main:app --reload &
BACKEND_PID=$!

# Start frontend in background
cd "$ROOT/frontend"
npm run dev &
FRONTEND_PID=$!

# Save PIDs for teardown
echo "$BACKEND_PID $FRONTEND_PID" > "$PID_FILE"

echo ""
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers."

# Stop both on Ctrl+C
trap "bash $ROOT/scripts/dev-teardown.sh" INT
wait
