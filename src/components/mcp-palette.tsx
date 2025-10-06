"use client";

import { useEffect, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { type McpServer } from "@/lib/mcps";

function PaletteItem({ server }: { server: McpServer }) {
  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
    id: server.id,
    data: { type: "palette", serverId: server.id },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={
        "border rounded-md p-3 bg-card hover:bg-secondary cursor-grab active:cursor-grabbing select-none transition-colors " +
        (isDragging ? "opacity-30 scale-95" : "hover:scale-[1.02]")
      }
    >
      <div className="flex items-start gap-3">
        {/* Icon placeholder; user will provide images later */}
        <div className="h-8 w-8 rounded-md bg-muted shrink-0" />
        <div>
          <div className="font-medium text-sm">{server.name}</div>
          <div className="text-xs text-muted-foreground">{server.description}</div>
        </div>
      </div>
    </div>
  );
}

export function McpPalette() {
  const [servers, setServers] = useState<McpServer[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const res = await fetch("/api/servers", { method: "POST" });
        if (!res.ok) throw new Error(`Failed to load servers: ${res.status}`);
        const data: {
          items: Array<{
            id: string;
            server: {
              name: string;
              description: string;
              $schema?: string;
              repository?: { url: string; source: string };
              version?: string;
              remotes?: Array<{ type: string; url: string }>;
            };
          }>;
        } = await res.json();

        const mapped: McpServer[] = data.items.map((item) => ({
          id: item.id,
          name: item.server.name,
          description: item.server.description,
          iconUrl: undefined,
          remoteUrl: item.server.remotes && item.server.remotes.length > 0 ? item.server.remotes[0].url : undefined,
          repositoryUrl: item.server.repository?.url,
          config: {
            server: {
              $schema: item.server.$schema ?? "https://static.modelcontextprotocol.io/schemas/2025-09-29/server.schema.json",
              name: item.server.name,
              description: item.server.description,
              remotes: (item.server.remotes ?? []).map((r) => ({ type: r.type, url: r.url })),
            },
          },
        }));

        if (isMounted) setServers(mapped);
      } catch (e: any) {
        if (isMounted) setError(e?.message ?? "Failed to load servers");
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const list = servers ?? [];

  return (
    <div className="space-y-3">
      {error && (
        <div className="text-xs text-destructive">{error}</div>
      )}
      {servers === null && !error && (
        <div className="text-xs text-muted-foreground">Loading servers…</div>
      )}
      {list.map((s) => (
        <PaletteItem key={s.id} server={s} />
      ))}
    </div>
  );
}


