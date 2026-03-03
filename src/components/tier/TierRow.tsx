"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { Trash2, Pencil, Check } from "lucide-react";
import type { TierItem, TierRowConfig } from "@/types/tier";
import { TIER_COLORS } from "@/lib/constants";
import { DraggableItem } from "./DraggableItem";
import { cn } from "@/lib/utils";

interface TierRowProps {
  row: TierRowConfig;
  itemIds: string[];
  itemsMap: Map<string, TierItem>;
  onRemove: (rowId: string) => void;
  onRename: (rowId: string, name: string) => void;
  onChangeColor: (rowId: string, color: string) => void;
}

export function TierRow({
  row,
  itemIds,
  itemsMap,
  onRemove,
  onRename,
  onChangeColor,
}: TierRowProps) {
  const { setNodeRef, isOver } = useDroppable({ id: row.id });
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(row.name);
  const [showSettings, setShowSettings] = useState(false);

  const handleSubmitName = () => {
    if (editName.trim()) {
      onRename(row.id, editName.trim());
    }
    setEditing(false);
  };

  return (
    <div className="flex min-h-[80px] border-b border-border last:border-b-0">
      {/* Tier label */}
      <div
        className="relative flex w-[100px] shrink-0 cursor-pointer items-center justify-center border-r border-border font-bold text-foreground select-none"
        style={{ backgroundColor: row.color }}
        onClick={() => setShowSettings((v) => !v)}
      >
        {editing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitName();
            }}
            className="flex items-center gap-1"
          >
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-14 rounded border border-border bg-background px-1 text-center text-sm"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="submit"
              className="rounded p-0.5 hover:bg-black/10"
              onClick={(e) => e.stopPropagation()}
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          </form>
        ) : (
          <span className="text-lg">{row.name}</span>
        )}

        {/* Settings dropdown */}
        {showSettings && !editing && (
          <div className="absolute top-full left-0 z-20 mt-1 w-[180px] rounded-md border border-border bg-background p-2 shadow-md" data-export-ignore>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditing(true);
                setEditName(row.name);
                setShowSettings(false);
              }}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent"
            >
              <Pencil className="h-3.5 w-3.5" />
              이름 변경
            </button>
            <div className="my-1.5 border-t border-border" />
            <div className="grid grid-cols-5 gap-1 px-1">
              {TIER_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChangeColor(row.id, color);
                  }}
                  className={cn(
                    "h-6 w-6 rounded-sm border",
                    row.color === color ? "border-foreground ring-1 ring-foreground" : "border-border"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="my-1.5 border-t border-border" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(row.id);
                setShowSettings(false);
              }}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-destructive hover:bg-accent"
            >
              <Trash2 className="h-3.5 w-3.5" />
              삭제
            </button>
          </div>
        )}
      </div>

      {/* Droppable item area */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[80px] flex-1 flex-wrap items-start gap-1 p-2 transition-colors",
          isOver && "bg-accent/50"
        )}
      >
        <SortableContext items={itemIds} strategy={horizontalListSortingStrategy}>
          {itemIds.map((id) => {
            const item = itemsMap.get(id);
            if (!item) return null;
            return <DraggableItem key={id} item={item} />;
          })}
        </SortableContext>
      </div>
    </div>
  );
}
