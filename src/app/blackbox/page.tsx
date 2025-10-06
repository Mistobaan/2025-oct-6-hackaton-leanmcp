"use client";

import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { ScrollArea } from "@/components/ui/scroll-area";
import { McpPalette } from "@/components/mcp-palette";
import { McpCanvas } from "@/components/mcp-canvas";
import { useLocalStorage } from "@/hooks/use-local-storage";

export default function BlackboxPage() {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const [selected, setSelected] = useLocalStorage<string[]>("selected-mcps", []);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || over.id !== "canvas") return;
    const data: any = (active as any).data?.current;
    if (data?.type === "palette" && typeof data.serverId === "string") {
      if (!selected.includes(data.serverId)) {
        setSelected([...selected, data.serverId]);
      }
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-background relative text-foreground">
        {/* grain + orb to match landing */}
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35] [background-image:radial-gradient(transparent_1px,rgba(0,0,0,0.15)_1px)] [background-size:3px_3px]" />
        <div className="pointer-events-none absolute -z-10 left-1/2 top-6 h-[300px] w-[300px] -translate-x-1/2 rounded-full blur-3xl [background:conic-gradient(from_180deg_at_50%_50%,oklch(0.78_0.24_340)_0%,oklch(0.78_0.24_20)_30%,oklch(0.75_0.22_90)_60%,oklch(0.8_0.22_10)_90%,oklch(0.78_0.24_340)_100%)]" />
        <header className="border-b p-4 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
          <div className="container mx-auto">
            <h1 className="text-2xl font-semibold tracking-tight">MCP Blackbox</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Drag MCP servers from the left into the blackbox to compose a single MCP.
            </p>
          </div>
        </header>
        <main className="container mx-auto p-4">
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
    </DndContext>
  );
}


