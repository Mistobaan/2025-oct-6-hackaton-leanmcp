# MCP Server (FastMCP)

This folder contains a minimal FastMCP server written in Python. The server embeds an MCP client so it can proxy tool calls to one or more external MCP servers declared in `external_mcps.json`.

## Quick start

1) Create/activate a virtualenv (recommended)

```bash
python -m venv .venv
# Windows PowerShell
. .venv/Scripts/Activate.ps1
# macOS/Linux
# source .venv/bin/activate
```

2) Install dependencies

```bash
pip install -r requirements.txt
```

3) Run the FastMCP server

```bash
python server.py
```

The server listens on http://127.0.0.1:8000/mcp by default.

## Configure external MCPs

Add entries to `external_mcps.json` like:

```json
[
  {
    "id": "example-json",
    "transport": "stdio",
    "command": "node",
    "args": ["path/to/server.js"]
  }
]
```

Supported transports: `stdio` and `sse` (http URL). For SSE, use:

```json
{ "id": "weather", "transport": "sse", "url": "http://localhost:9000/mcp" }
```

## How it works

- `server.py` exposes built-in demo tools and a generic `call_external_tool` that calls a tool on any configured external MCP.
- `client_manager.py` manages connections to external MCP servers using the official Python MCP client.

## Dev commands

```bash
# lint types
python -m pip install ruff
ruff check .
```

## Notes

- You’ll provide the external MCPs later; just update `external_mcps.json` and restart.
