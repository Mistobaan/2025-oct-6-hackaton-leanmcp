"use client";

import { useDroppable } from "@dnd-kit/core";
import { useMemo, useEffect, useState } from "react";
import Image from "next/image";
import { type McpServer } from "@/lib/mcps";

export type Selected = string[];

export function McpCanvas({
  selected,
  setSelected,
}: {
  selected: Selected;
  setSelected: (ids: Selected) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ 
    id: "canvas", 
    data: { type: "canvas" } 
  });

  const [allServers, setAllServers] = useState<McpServer[]>([]);

  useEffect(() => {
    async function loadServers() {
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
              icon?: string;
            };
          }>;
        } = await res.json();

        const mapped: McpServer[] = data.items.map((item) => ({
          id: item.id,
          name: item.server.name,
          description: item.server.description,
          iconUrl: item.server.icon,
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

        setAllServers(mapped);
      } catch (e: any) {
        console.error("Failed to load servers for canvas:", e);
      }
    }
    loadServers();
  }, []);

  const serversById = useMemo(() =>
    Object.fromEntries(allServers.map((s) => [s.id, s])),
  [allServers]);

  const selectedServers: McpServer[] = selected.map((id) => serversById[id]).filter(Boolean);

  // drop logic moved to page to ensure cross-column dnd works reliably

  return (
    <div className="h-full flex flex-col gap-4">
      <div
        ref={setNodeRef}
        className={
          "flex-1 rounded-md border border-dashed p-4 transition-colors " +
          (isOver 
            ? "bg-secondary border-primary border-2 scale-[1.02]" 
            : "bg-card hover:bg-muted/50")
        }
      >
        <div className="text-sm text-muted-foreground mb-2">
          MCP Blackbox — drop MCPs here
          {isOver && <span className="text-primary font-medium"> (Drop to add)</span>}
        </div>
        {selectedServers.length === 0 ? (
          <div className="h-full grid place-items-center text-sm text-muted-foreground">
            {isOver ? (
              <div className="text-center">
                <div className="text-lg mb-2">🎯</div>
                <div>Drop here to add MCP server</div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-lg mb-2">📦</div>
                <div>Drag and drop MCPs from the left to compose</div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {selectedServers.map((s) => (
              <div key={s.id} className="flex items-start gap-3 border rounded-md p-3 bg-background hover:bg-muted/50 transition-colors">
                {s.iconUrl ? (
                  <Image
                    src={s.iconUrl}
                    alt={`${s.name} icon`}
                    width={24}
                    height={24}
                    className="h-6 w-6 rounded border border-border bg-background object-contain p-0.5 shrink-0"
                  />
                ) : (
                  <div className="h-6 w-6 rounded bg-muted shrink-0" />
                )}
                <div className="flex-1">
                  <div className="text-sm font-medium">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.description}</div>
                </div>
                <button
                  className="text-xs underline text-muted-foreground hover:text-destructive transition-colors"
                  onClick={() => setSelected(selected.filter((id) => id !== s.id))}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom JSON action buttons removed as requested */}
    </div>
  );
}

// onDragEnd export removed; logic handled on page


