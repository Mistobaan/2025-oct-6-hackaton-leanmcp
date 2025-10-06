from __future__ import annotations

import asyncio
import json
from pathlib import Path
from typing import Dict, Optional, Any, List

from usemcp import StdioServerParameters, ClientSession, SSEServerParameters

CONFIG_PATH = Path(__file__).with_name("external_mcps.json")


class ExternalClientManager:
    """Lazy manager of MCP client sessions for configured external servers."""

    def __init__(self, config_path: Optional[Path] = None) -> None:
        self.config_path = Path(config_path) if config_path else CONFIG_PATH
        self._sessions: Dict[str, ClientSession] = {}
        self._config: List[Dict[str, Any]] = []
        self._load_config()

    def _load_config(self) -> None:
        if self.config_path.exists():
            self._config = json.loads(self.config_path.read_text(encoding="utf-8"))
        else:
            self._config = []

    def list_servers(self) -> List[str]:
        return [cfg.get("id") for cfg in self._config if cfg.get("id")]

    async def _connect(self, server_id: str) -> ClientSession:
        if server_id in self._sessions:
            return self._sessions[server_id]

        cfg = next((c for c in self._config if c.get("id") == server_id), None)
        if not cfg:
            raise ValueError(f"Unknown server id: {server_id}")

        transport = cfg.get("transport", "stdio")
        if transport == "stdio":
            params = StdioServerParameters(command=cfg["command"], args=cfg.get("args", []))
        elif transport == "sse":
            params = SSEServerParameters(url=cfg["url"])  # type: ignore
        else:
            raise ValueError(f"Unsupported transport: {transport}")

        session = await ClientSession.connect(params)
        self._sessions[server_id] = session
        return session

    async def call_tool(self, server_id: str, tool_name: str, arguments: Dict[str, Any]) -> Any:
        session = await self._connect(server_id)
        result = await session.call_tool(tool_name, arguments)
        return result

    async def close_all(self) -> None:
        await asyncio.gather(*(session.close() for session in self._sessions.values()), return_exceptions=True)
        self._sessions.clear()

    async def list_tools(self, server_id: str) -> List[Dict[str, Any]]:
        """Return the list of tools exposed by an external MCP server, if supported.

        Falls back to an empty list if the server/client does not support tool listing.
        """
        session = await self._connect(server_id)
        # Some implementations may expose `list_tools` or `get_tools`; try common options.
        if hasattr(session, "list_tools"):
            # type: ignore[attr-defined]
            return await session.list_tools()  # type: ignore[attr-defined]
        if hasattr(session, "get_tools"):
            # type: ignore[attr-defined]
            return await session.get_tools()  # type: ignore[attr-defined]
        return []