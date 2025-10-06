import { NextRequest, NextResponse } from "next/server";

interface Server {
  $schema: string;
  name: string;
  description: string;
  repository: { url: string; source: string };
  version: string;
  remotes: { type: string; url: string }[];
}

interface ServerMeta {
  "io.modelcontextprotocol.registry/official": {
    status: string;
    publishedAt: string;
    updatedAt: string;
    isLatest: boolean;
  };
}

interface ServerRecord {
  id: string;
  score: number;
  server: Server;
  _meta: ServerMeta;
}

interface RequestBody {
  prompt: string;
  topK?: number;
}

const SERVERS: ServerRecord[] = [
  {
    id: "ai.alpic.test/test-mcp-server@0.0.1",
    score: 0.91,
    server: {
      $schema: "https://static.modelcontextprotocol.io/schemas/2025-09-29/server.schema.json",
      name: "ai.alpic.test/test-mcp-server",
      description: "Alpic Test MCP Server - great server!",
      repository: { url: "", source: "" },
      version: "0.0.1",
      remotes: [{ type: "streamable-http", url: "https://test.alpic.ai/" }],
    },
    _meta: {
      "io.modelcontextprotocol.registry/official": {
        status: "active",
        publishedAt: "2025-09-10T13:57:43.256739Z",
        updatedAt: "2025-09-10T13:57:43.256739Z",
        isLatest: true,
      },
    },
  },
  {
    id: "ai.explorium/mcp-explorium@1.0.0",
    score: 0.88,
    server: {
      $schema: "https://static.modelcontextprotocol.io/schemas/2025-09-29/server.schema.json",
      name: "ai.explorium/mcp-explorium",
      description:
        "Access live company and contact data from Explorium's AgentSource B2B platform.",
      repository: { url: "", source: "" },
      version: "1.0.0",
      remotes: [
        { type: "sse", url: "https://mcp-github-registry.explorium.ai/sse" },
      ],
    },
    _meta: {
      "io.modelcontextprotocol.registry/official": {
        status: "active",
        publishedAt: "2025-09-16T21:06:15.352229Z",
        updatedAt: "2025-09-16T21:06:15.352229Z",
        isLatest: true,
      },
    },
  },
  {
    id: "ai.klavis/strata@1.0.0",
    score: 0.86,
    server: {
      $schema: "https://static.modelcontextprotocol.io/schemas/2025-09-29/server.schema.json",
      name: "ai.klavis/strata",
      description:
        "MCP server for progressive tool usage at any scale (see https://klavis.ai)",
      repository: {
        url: "https://github.com/Klavis-AI/klavis",
        source: "github",
      },
      version: "1.0.0",
      remotes: [
        { type: "streamable-http", url: "https://strata.klavis.ai/mcp/" },
      ],
    },
    _meta: {
      "io.modelcontextprotocol.registry/official": {
        status: "active",
        publishedAt: "2025-09-28T19:13:44.307076Z",
        updatedAt: "2025-09-28T19:13:44.307076Z",
        isLatest: true,
      },
    },
  },
];

export async function GET(req: NextRequest) {
    return POST(req);
}

export async function POST(req: NextRequest) {
  try {

    // const body: RequestBody = await req.json();
    // if (!body.prompt || typeof body.prompt !== "string") {
    //   return NextResponse.json(
    //     { code: "bad_request", message: "Missing or invalid prompt" },
    //     { status: 400 }
    //   );
    // }

    const topK = Math.min(20, SERVERS.length);
    const results = SERVERS.slice(0, topK);

    return NextResponse.json({
      total: results.length,
      nextOffset: null,
      items: results,
    });
  } catch (e) {
    console.log(e)
    return NextResponse.json(
      { code: "server_error", message: "Failed to process request" },
      { status: 500 }
    );
  }
}