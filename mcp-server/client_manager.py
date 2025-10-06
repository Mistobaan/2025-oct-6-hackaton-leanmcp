from __future__ import annotations

import asyncio
import json
import secrets
import urllib.parse
from pathlib import Path
from typing import Dict, Optional, Any, List
from dataclasses import dataclass

from fastmcp import Client

CONFIG_PATH = Path(__file__).with_name("external_mcps.json")


@dataclass
class OAuthState:
    """OAuth state for tracking authorization flows."""
    server_id: str
    state: str
    code_verifier: str
    redirect_uri: str
    scopes: List[str]


class ExternalClientManager:
    """Lazy manager of MCP client sessions for configured external servers."""

    def __init__(self, config_path: Optional[Path] = None) -> None:
        self.config_path = Path(config_path) if config_path else CONFIG_PATH
        self._clients: Dict[str, Client] = {}
        self._config: List[Dict[str, Any]] = []
        self._oauth_states: Dict[str, OAuthState] = {}  # state -> OAuthState
        self._tokens: Dict[str, Dict[str, Any]] = {}  # server_id -> token_info
        self._load_config()

    def _load_config(self) -> None:
        if self.config_path.exists():
            self._config = json.loads(self.config_path.read_text(encoding="utf-8"))
        else:
            self._config = []

    def list_servers(self) -> List[str]:
        return [cfg.get("id") for cfg in self._config if cfg.get("id")]

    async def _connect(self, server_id: str) -> Client:
        if server_id in self._clients:
            return self._clients[server_id]

        cfg = next((c for c in self._config if c.get("id") == server_id), None)
        if not cfg:
            raise ValueError(f"Unknown server id: {server_id}")

        transport = cfg.get("transport", "sse")
        if transport == "sse":
            url = cfg["url"]
            client = Client(url)
        elif transport == "stdio":
            # For stdio, we'd need to implement subprocess handling
            # For now, raise an error as FastMCP Client primarily supports HTTP/SSE
            raise ValueError("FastMCP Client doesn't support stdio transport yet")
        else:
            raise ValueError(f"Unsupported transport: {transport}")

        self._clients[server_id] = client
        return client

    async def call_tool(self, server_id: str, tool_name: str, arguments: Dict[str, Any]) -> Any:
        client = await self._connect(server_id)
        
        try:
            async with client:
                # Add OAuth token if available
                if server_id in self._tokens:
                    token_info = self._tokens[server_id]
                    if "access_token" in token_info:
                        # FastMCP Client should handle auth headers automatically
                        # We might need to set headers on the client
                        pass
                
                result = await client.call_tool(tool_name, arguments)
                # FastMCP returns structured results, extract the content
                if hasattr(result, 'content') and result.content:
                    return result.content[0].text if hasattr(result.content[0], 'text') else result.content[0]
                return result
        except Exception as e:
            # Check if this is an OAuth 401 error
            if "401" in str(e) or "Unauthorized" in str(e):
                # Try to initiate OAuth flow
                oauth_url = await self._initiate_oauth_flow(server_id)
                if oauth_url:
                    return {
                        "error": "oauth_required",
                        "message": "OAuth authentication required",
                        "oauth_url": oauth_url,
                        "server_id": server_id
                    }
            raise

    async def _initiate_oauth_flow(self, server_id: str) -> Optional[str]:
        """Initiate OAuth flow for a server. Returns OAuth URL or None."""
        try:
            # Generate OAuth state and code verifier for PKCE
            state = secrets.token_urlsafe(32)
            code_verifier = secrets.token_urlsafe(32)
            
            # For now, use a simple redirect URI (in production, this should be configurable)
            redirect_uri = "http://localhost:8000/oauth/callback"
            
            oauth_state = OAuthState(
                server_id=server_id,
                state=state,
                code_verifier=code_verifier,
                redirect_uri=redirect_uri,
                scopes=["openid", "email", "profile"]  # Default scopes
            )
            
            self._oauth_states[state] = oauth_state
            
            # Try to get OAuth metadata from the server
            client = await self._connect(server_id)
            async with client:
                # For now, we'll use a simplified approach
                # In a real implementation, we'd call a tool to get OAuth metadata
                # For Gmail and other services, we can hardcode the OAuth endpoints
                
                if server_id == "gmail-mcp":
                    # Google OAuth endpoints
                    auth_url = "https://accounts.google.com/o/oauth2/v2/auth"
                    client_id = "your-gmail-client-id"  # This should be configurable
                    
                    if auth_url and client_id:
                        # Build OAuth URL with PKCE
                        params = {
                            "response_type": "code",
                            "client_id": client_id,
                            "redirect_uri": redirect_uri,
                            "scope": " ".join(oauth_state.scopes),
                            "state": state,
                            "code_challenge": self._generate_code_challenge(code_verifier),
                            "code_challenge_method": "S256"
                        }
                        
                        return f"{auth_url}?{urllib.parse.urlencode(params)}"
            
            return None
        except Exception:
            return None
    
    def _generate_code_challenge(self, code_verifier: str) -> str:
        """Generate PKCE code challenge from verifier."""
        import hashlib
        import base64
        
        digest = hashlib.sha256(code_verifier.encode()).digest()
        return base64.urlsafe_b64encode(digest).decode().rstrip('=')
    
    async def handle_oauth_callback(self, state: str, code: str) -> Dict[str, Any]:
        """Handle OAuth callback with authorization code."""
        if state not in self._oauth_states:
            return {"error": "invalid_state"}
        
        oauth_state = self._oauth_states[state]
        
        try:
            # Exchange code for token
            client = await self._connect(oauth_state.server_id)
            async with client:
                # For now, we'll use a simplified token exchange
                # In a real implementation, we'd call a tool to exchange the code
                # For Gmail, we'd make a direct HTTP call to Google's token endpoint
                
                if oauth_state.server_id == "gmail-mcp":
                    # This is a placeholder - in reality, we'd make an HTTP POST to Google's token endpoint
                    # with the authorization code, client credentials, etc.
                    token_info = {
                        "access_token": "placeholder_token",
                        "token_type": "Bearer",
                        "expires_in": 3600
                    }
                    
                    # Store token
                    self._tokens[oauth_state.server_id] = token_info
                    
                    # Clean up OAuth state
                    del self._oauth_states[state]
                    
                    return {"success": True, "server_id": oauth_state.server_id}
        
        except Exception as e:
            return {"error": str(e)}
        
        return {"error": "token_exchange_failed"}

    async def close_all(self) -> None:
        # FastMCP clients are closed automatically when exiting async context
        # Just clear our references
        self._clients.clear()

    async def list_tools(self, server_id: str) -> List[Dict[str, Any]]:
        """Return the list of tools exposed by an external MCP server, if supported.

        Falls back to an empty list if the server/client does not support tool listing.
        """
        client = await self._connect(server_id)
        try:
            async with client:
                tools = await client.list_tools()
                # Convert FastMCP tool objects to dict format
                if hasattr(tools, 'tools'):
                    return [{"name": tool.name, "description": tool.description} for tool in tools.tools]
                return []
        except Exception:
            return []