"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { McpPalette } from "@/components/mcp-palette";
import { McpCanvas } from "@/components/mcp-canvas";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { type McpServer } from "@/lib/mcps";
import Image from "next/image";

export default function BlackboxPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const [selected, setSelected] = useLocalStorage<string[]>("selected-mcps", []);
  const [activeServer, setActiveServer] = useState<McpServer | null>(null);
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
        console.error("Failed to load servers for drag overlay:", e);
      }
    }
    loadServers();
  }, []);

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const data: any = (active as any).data?.current;
    if (data?.type === "palette" && typeof data.serverId === "string") {
      // Find the server data for the drag overlay
      const server = allServers.find(s => s.id === data.serverId);
      if (server) {
        setActiveServer(server);
      }
    }
  }

  async function handleCreateClick() {
    setIsCreating(true);
    setError(null);
    try {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: "Create MCP session",
          mcpServerIds: selected,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (!data?.url || typeof data.url !== "string") {
        throw new Error("Response missing URL");
      }

      router.push(`/blackbox/created?url=${encodeURIComponent(data.url)}`);
    } catch (err) {
      console.error(err);
      setError("Failed to create MCP. Please try again.");
    } finally {
      setIsCreating(false);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveServer(null);
    
    if (!over || over.id !== "canvas") return;
    
    const data: any = (active as any).data?.current;
    if (data?.type === "palette" && typeof data.serverId === "string") {
      if (!selected.includes(data.serverId)) {
        setSelected([...selected, data.serverId]);
      }
    }
  }

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-background relative text-foreground">
        {/* grain + orb to match landing */}
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35] [background-image:radial-gradient(transparent_1px,rgba(0,0,0,0.15)_1px)] [background-size:3px_3px]" />
        <div className="pointer-events-none absolute -z-10 left-1/2 top-6 h-[300px] w-[300px] -translate-x-1/2 rounded-full blur-3xl [background:conic-gradient(from_180deg_at_50%_50%,oklch(0.78_0.24_340)_0%,oklch(0.78_0.24_20)_30%,oklch(0.75_0.22_90)_60%,oklch(0.8_0.22_10)_90%,oklch(0.78_0.24_340)_100%)]" />
        <header className="border-b p-4 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                MCP Blackbox
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Drag MCP servers from the left into the blackbox to compose a
                single MCP.
              </p>
            </div>
            <Button
              className="bg-purple-600 text-white hover:bg-purple-600/90"
              disabled={isCreating}
              onClick={handleCreateClick}
            >
              Create MCP
            </Button>
          </div>
        </header>
        <main className="container mx-auto p-4">
          {error && (
            <p className="mb-4 text-sm text-red-500" role="alert">
              {error}
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100vh-160px)]">
            <div className="md:col-span-1">
              <ScrollArea className="h-full pr-2">
                <McpPalette />
              </ScrollArea>
            </div>
            <div className="md:col-span-1 h-full">
              <McpCanvas selected={selected} setSelected={setSelected} />
            </div>
          </div>
        </main>
      </div>
      
      <DragOverlay>
        {activeServer ? (
          <div className="border rounded-md p-3 bg-card shadow-lg opacity-90 rotate-3">
            <div className="flex items-start gap-3">
              {activeServer.iconUrl ? (
                <Image
                  src={activeServer.iconUrl}
                  alt={`${activeServer.name} icon`}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-md border border-border bg-background object-contain p-1 shrink-0"
                />
              ) : (
                <div className="h-8 w-8 rounded-md bg-muted shrink-0" />
              )}
              <div>
                <div className="font-medium text-sm">{activeServer.name}</div>
                <div className="text-xs text-muted-foreground">{activeServer.description}</div>
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
