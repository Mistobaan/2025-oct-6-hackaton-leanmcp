"use client";

import { useDraggable } from "@dnd-kit/core";
import { MCP_SERVERS, type McpServer } from "@/lib/mcps";

function PaletteItem({ server }: { server: McpServer }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: server.id,
    data: { type: "palette", serverId: server.id },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={
        "border rounded-md p-3 bg-card hover:bg-secondary cursor-grab active:cursor-grabbing select-none " +
        (isDragging ? "opacity-50" : "")
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
  return (
    <div className="space-y-3">
      {MCP_SERVERS.map((s) => (
        <PaletteItem key={s.id} server={s} />
      ))}
    </div>
  );
}


