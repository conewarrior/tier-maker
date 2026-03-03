"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import type { TierItem } from "@/types/tier";
import { DraggableItem } from "./DraggableItem";
import { cn } from "@/lib/utils";

interface UnplacedItemsProps {
  itemIds: string[];
  itemsMap: Map<string, TierItem>;
}

export function UnplacedItems({ itemIds, itemsMap }: UnplacedItemsProps) {
  const { setNodeRef, isOver } = useDroppable({ id: "unplaced" });

  return (
    <div className="rounded-lg border border-border">
      <div className="border-b border-border bg-muted px-4 py-2">
        <span className="text-sm font-medium text-muted-foreground">
          미배치 아이템
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[96px] flex-wrap items-start gap-1 p-2 transition-colors",
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
