"use client";

import { useDroppable, useDraggable, DragEndEvent } from "@dnd-kit/core";
import { useMemo } from "react";
import { MCP_SERVERS, type McpServer, composeCombinedMcp } from "@/lib/mcps";

export type Selected = string[];

export function McpCanvas({
  selected,
  setSelected,
}: {
  selected: Selected;
  setSelected: (ids: Selected) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: "canvas", data: { type: "canvas" } });

  const serversById = useMemo(() =>
    Object.fromEntries(MCP_SERVERS.map((s) => [s.id, s])),
  []);

  const selectedServers: McpServer[] = selected.map((id) => serversById[id]).filter(Boolean);

  const combined = useMemo(() => composeCombinedMcp(selectedServers), [selectedServers]);

  // drop logic moved to page to ensure cross-column dnd works reliably

  return (
    <div className="h-full flex flex-col gap-4">
      <div
        ref={setNodeRef}
        className={
          "flex-1 rounded-md border border-dashed p-4 " +
          (isOver ? "bg-secondary" : "bg-card")
        }
      >
        <div className="text-sm text-muted-foreground mb-2">MCP Blackbox — drop MCPs here</div>
        {selectedServers.length === 0 ? (
          <div className="h-full grid place-items-center text-sm text-muted-foreground">
            Drag and drop MCPs from the left to compose
          </div>
        ) : (
          <div className="space-y-2">
            {selectedServers.map((s) => (
              <div key={s.id} className="flex items-start gap-3 border rounded-md p-3 bg-background">
                <div className="h-6 w-6 rounded bg-muted shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.description}</div>
                </div>
                <button
                  className="text-xs underline text-muted-foreground"
                  onClick={() => setSelected(selected.filter((id) => id !== s.id))}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-x-2">
        <button
          className="px-3 py-2 text-sm rounded-md border"
          onClick={() => navigator.clipboard.writeText(JSON.stringify(combined, null, 2))}
        >
          Copy combined MCP JSON
        </button>
        <button
          className="px-3 py-2 text-sm rounded-md border"
          onClick={() => {
            const blob = new Blob([JSON.stringify(combined, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "combined-mcp.json";
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Download JSON
        </button>
      </div>
    </div>
  );
}

export { onDragEnd };


