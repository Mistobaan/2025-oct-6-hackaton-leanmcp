FROM python:3.11-slim

# Prevent Python from writing .pyc files and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# System deps: build tools for any wheels; clean up afterwards
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better layer caching
COPY requirements.txt /app/requirements.txt
RUN pip install --upgrade pip && pip install -r /app/requirements.txt

# Copy server code and configuration
COPY server.py /app/server.py
COPY client_manager.py /app/client_manager.py
COPY external_mcps.json /app/external_mcps.json
COPY README.md /app/README.md

# Expose the default FastMCP port (Fly will set PORT env)
EXPOSE 8000

# Healthcheck: ensure server answers on /mcp (FastMCP default path)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python - << 'PY'
import os, sys
import http.client

host = '127.0.0.1'
port = int(os.getenv('PORT', '8000'))
try:
    conn = http.client.HTTPConnection(host, port, timeout=3)
    conn.request('GET', '/mcp')
    resp = conn.getresponse()
    # 404 is fine, just want a response
    sys.exit(0 if resp.status in (200, 400, 404) else 1)
except Exception:
    sys.exit(1)
PY

# Default command runs the FastMCP server directly with Python
CMD ["python", "server.py"]


