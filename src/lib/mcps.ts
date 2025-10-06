export type McpServer = {
  id: string;
  name: string;
  description: string;
  iconUrl?: string; // provided later by user
  remoteUrl?: string; // e.g., smithery streamable-http url
  repositoryUrl?: string;
  config: Record<string, unknown>; // canonical MCP server object snippet
};

// Hardcoded MCP servers to display in the palette
export const MCP_SERVERS: McpServer[] = [
  {
    id: "official-gdrive",
    name: "Google Drive (Official)",
    description: "Browse, search, and manage files in Google Drive via MCP.",
    remoteUrl: "https://server.smithery.ai/@KaranThink41/official-gdrive-mcp/mcp",
    repositoryUrl: "https://github.com/KaranThink41/official-gdrive-mcp",
    config: {
      server: {
        $schema: "https://static.modelcontextprotocol.io/schemas/2025-09-29/server.schema.json",
        name: "ai.smithery/official-gdrive-mcp",
        description:
          "Browse, search, and manage files in Google Drive via MCP.",
        remotes: [
          {
            type: "streamable-http",
            url: "https://server.smithery.ai/@KaranThink41/official-gdrive-mcp/mcp",
          },
        ],
      },
    },
  },
  // Add more from public/servers.json as needed. Keeping minimal for hackathon.
];

export function composeCombinedMcp(selected: McpServer[]) {
  return {
    $schema: "https://static.modelcontextprotocol.io/schemas/2025-09-29/client.schema.json",
    name: "combined-mcp-blackbox",
    description:
      "Exposes selected MCP servers as a single virtual MCP using a passthrough tool namespace.",
    // Implementation detail for demonstration: just echo the selected server configs
    combinedServers: selected.map((s) => s.config),
  } as const;
}


