from __future__ import annotations

import asyncio
from typing import Any, Dict

from fastmcp import FastMCP
from pydantic import BaseModel

from client_manager import ExternalClientManager

mcp = FastMCP("blackbox-server")
clients = ExternalClientManager()


class SumArgs(BaseModel):
    a: float
    b: float


@mcp.tool()
async def sum_numbers(args: SumArgs) -> float:
    """Simple demo tool: returns a + b."""
    return args.a + args.b


class ExternalCallArgs(BaseModel):
    server_id: str
    tool: str
    arguments: Dict[str, Any] = {}


@mcp.tool()
async def call_external_tool(args: ExternalCallArgs) -> Any:
    """Call a tool on a configured external MCP server."""
    return await clients.call_tool(args.server_id, args.tool, args.arguments)


@mcp.tool()
async def list_external_servers() -> list[str]:
    """List configured external MCP server ids."""
    return clients.list_servers()


if __name__ == "__main__":
    try:
        mcp.run()
    finally:
        # ensure we cleanup any sessions on shutdown
        asyncio.run(clients.close_all())
