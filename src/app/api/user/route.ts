import { NextRequest, NextResponse } from "next/server";

interface RequestBody {
  prompt: string;
  mcpServerIds: string[];
  ttlSeconds?: number;
}
export async function GET(req: NextRequest) {
  return POST(req)
}

export async function POST(req: NextRequest) {
  try {
{
    //const body: RequestBody = await req.json();
    const requestId = crypto.randomUUID();
    //const expiresAt = new Date(Date.now() + (body.ttlSeconds ?? 3600) * 1000);
    const sessionId = crypto.randomUUID();
    const url = `https://blackbox.entropysource.com/protocols/${sessionId}`;
    
    const response = {
      requestId,
      url,
      // expiresAt: expiresAt.toISOString(),
      // mcpServerIds: body.mcpServerIds,
    };
    
    return new NextResponse(JSON.stringify(response), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        Location: url,
      },
    });
  }

    const body: RequestBody = await req.json();

    if (!body.prompt || !Array.isArray(body.mcpServerIds)) {
      return NextResponse.json(
        { code: "bad_request", message: "Missing prompt or mcpServerIds" },
        { status: 400 }
      );
    }

    const requestId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + (body.ttlSeconds ?? 3600) * 1000);
    const sessionId = crypto.randomUUID();
    const url = `https://app.yourdomain.com/sessions/${sessionId}`;

    const response = {
      requestId,
      url,
      expiresAt: expiresAt.toISOString(),
      mcpServerIds: body.mcpServerIds,
    };

    return new NextResponse(JSON.stringify(response), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        Location: url,
      },
    });
  } catch (e) {
    console.log(e)
    return NextResponse.json(
      { code: "server_error", message: "Failed to create session" },
      { status: 500 }
    );
  }
}