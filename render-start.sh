#!/usr/bin/env bash
set -euo pipefail

# Start the FastAPI app using the virtualenv created during build
if [ -d ".venv" ]; then
  . .venv/bin/activate
fi

# Use gunicorn if available in the venv, otherwise fallback to uvicorn
if command -v gunicorn >/dev/null 2>&1; then
  .venv/bin/gunicorn -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:${PORT:-10000} --workers 1
else
  .venv/bin/uvicorn main:app --host 0.0.0.0 --port ${PORT:-10000}
fi
