import { NextRequest, NextResponse } from "next/server";

interface Server {
  $schema: string;
  name: string;
  description: string;
  repository: { url: string; source: string };
  version: string;
  remotes: { type: string; url: string }[];
  icon?: string;
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

// interface RequestBody {
//   prompt: string;
//   topK?: number;
// }

const SERVERS: ServerRecord[] = [
  {
    id: "com.slack/mcp-slack@0.1.0",
    score: 0.95,
    server: {
      $schema: "https://static.modelcontextprotocol.io/schemas/2025-09-29/server.schema.json",
      name: "Slack Workspace MCP",
      description:
        "Interact with Slack channels, search conversations, and post updates from a single MCP interface.",
      repository: {
        url: "https://github.com/example/slack-mcp",
        source: "github",
      },
      version: "0.1.0",
      remotes: [
        { type: "streamable-http", url: "https://mcp.fake-slack.com/mcp" },
      ],
      icon: "/slack.png",
    },
    _meta: {
      "io.modelcontextprotocol.registry/official": {
        status: "experimental",
        publishedAt: "2025-10-01T09:30:00.000Z",
        updatedAt: "2025-10-01T09:30:00.000Z",
        isLatest: true,
      },
    },
  },
  {
    id: "com.google/drive-mcp@0.2.0",
    score: 0.92,
    server: {
      $schema: "https://static.modelcontextprotocol.io/schemas/2025-09-29/server.schema.json",
      name: "Google Drive MCP",
      description:
        "Browse, search, and manage Google Drive documents with structured MCP tools.",
      repository: {
        url: "https://github.com/example/google-drive-mcp",
        source: "github",
      },
      version: "0.2.0",
      remotes: [
        { type: "streamable-http", url: "https://mcp.fake-gdrive.com/mcp" },
      ],
      icon: "/gdrive.png",
    },
    _meta: {
      "io.modelcontextprotocol.registry/official": {
        status: "active",
        publishedAt: "2025-09-18T12:00:00.000Z",
        updatedAt: "2025-10-03T08:45:00.000Z",
        isLatest: true,
      },
    },
  },
  {
    id: "com.atlassian/jira-mcp@0.5.1",
    score: 0.9,
    server: {
      $schema: "https://static.modelcontextprotocol.io/schemas/2025-09-29/server.schema.json",
      name: "Jira Project MCP",
      description:
        "Query Jira issues, transition workflows, and file updates straight from MCP prompts.",
      repository: {
        url: "https://github.com/example/jira-mcp",
        source: "github",
      },
      version: "0.5.1",
      remotes: [
        { type: "streamable-http", url: "https://mcp.fake-jira.com/mcp" },
      ],
      icon: "/JIRA.png",
    },
    _meta: {
      "io.modelcontextprotocol.registry/official": {
        status: "beta",
        publishedAt: "2025-08-22T16:15:00.000Z",
        updatedAt: "2025-09-30T10:20:00.000Z",
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
    console.log(req)
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
