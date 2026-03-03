"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TierItem } from "@/types/tier";
import { cn } from "@/lib/utils";

interface DraggableItemProps {
  item: TierItem;
  overlay?: boolean;
}

export function DraggableItem({ item, overlay }: DraggableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "flex h-[72px] w-[72px] shrink-0 cursor-grab flex-col items-center justify-center gap-1 rounded-md border border-border bg-background p-1 select-none",
        isDragging && "z-10 opacity-40",
        overlay && "cursor-grabbing shadow-lg"
      )}
    >
      <div className="flex h-[44px] w-[44px] items-center justify-center overflow-hidden rounded bg-muted">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}
      </div>
      <span className="max-w-full truncate text-[10px] leading-tight text-foreground">
        {item.name}
      </span>
    </div>
  );
}
