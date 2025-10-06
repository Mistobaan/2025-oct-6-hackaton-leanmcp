from __future__ import annotations

import asyncio
import os
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


@mcp.tool()
async def list_external_tools(server_id: str) -> Any:
    """List tools from a specific external MCP server, if supported."""
    return await clients.list_tools(server_id)


@mcp.tool()
async def authenticate_gmail() -> str:
    """Start Gmail OAuth authentication process.
    
    Returns instructions for completing the authentication flow.
    """
    try:
        # Start the OAuth flow using the authenticate tool
        result = await clients.call_tool("gmail-mcp", "authenticate", {})
        return f"Gmail authentication started. Follow the instructions: {result}"
    except Exception as e:
        return f"Failed to start Gmail authentication: {str(e)}"


@mcp.tool()
async def check_gmail_auth() -> Any:
    """Check Gmail authentication status."""
    try:
        return await clients.call_tool("gmail-mcp", "check_auth_status", {})
    except Exception as e:
        return f"Failed to check Gmail auth status: {str(e)}"


class ChainStep(BaseModel):
    server_id: str
    tool: str
    arguments: Dict[str, Any] = {}


class ChainArgs(BaseModel):
    steps: list[ChainStep]


def _resolve_placeholder(value: Any, prev_result: Any) -> Any:
    """Resolve simple placeholders in strings.

    Supported forms:
    - "{{prev}}" → previous step's raw result
    - "{{prev.path}}" → JSONPath-like simple dot access into dict/list
    """
    if not isinstance(value, str):
        return value
    if value == "{{prev}}":
        return prev_result
    if value.startswith("{{prev.") and value.endswith("}}"):
        path = value[len("{{prev.") : -2].strip()
        target = prev_result
        for part in path.split("."):
            if isinstance(target, dict):
                target = target.get(part)
            elif isinstance(target, list):
                try:
                    idx = int(part)
                except ValueError:
                    return None
                target = target[idx] if 0 <= idx < len(target) else None
            else:
                return None
        return target
    return value


def _substitute_arguments(arguments: Dict[str, Any], prev_result: Any) -> Dict[str, Any]:
    def walk(node: Any) -> Any:
        if isinstance(node, dict):
            return {k: walk(v) for k, v in node.items()}
        if isinstance(node, list):
            return [walk(v) for v in node]
        return _resolve_placeholder(node, prev_result)

    return walk(arguments)


@mcp.tool()
async def chain_tools(args: ChainArgs) -> list[Any]:
    """Execute a sequence of external MCP tools, passing previous results via placeholders.

    Use "{{prev}}" or "{{prev.path}}" in step arguments to reference outputs of the prior step.
    Returns the list of each step's result in order.
    """
    results: list[Any] = []
    prev: Any = None
    for idx, step in enumerate(args.steps):
        step_args = _substitute_arguments(step.arguments, prev)
        result = await clients.call_tool(step.server_id, step.tool, step_args)
        results.append(result)
        prev = result
    return results


if __name__ == "__main__":
    try:
        # FastMCP runs directly with Python
        # Run with: python server.py
        # Check if FastMCP supports host/port parameters
        host = "0.0.0.0"
        port = int(os.getenv("PORT", "8000"))
        
        # Try to run with host/port if supported
        try:
            mcp.run(host=host, port=port)
        except TypeError:
            # If host/port not supported, run with defaults
            print(f"Starting FastMCP server on default host/port (PORT env var: {port})")
            mcp.run()
    finally:
        # ensure we cleanup any sessions on shutdown
        asyncio.run(clients.close_all())
