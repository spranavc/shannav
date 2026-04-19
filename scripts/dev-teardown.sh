#!/bin/bash
# Stop backend and frontend dev servers

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PID_FILE="$ROOT/.dev-pids"

if [ -f "$PID_FILE" ]; then
  pids=$(cat "$PID_FILE")
  for pid in $pids; do
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" && echo "Stopped PID $pid"
    fi
  done
  rm "$PID_FILE"
  echo "Dev servers stopped."
else
  echo "No running dev session found."
fi
