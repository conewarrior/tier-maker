"use client";

import { useMemo, type RefObject } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Plus, RotateCcw } from "lucide-react";
import type { TierItem } from "@/types/tier";
import { useTierEditor } from "@/hooks/useTierEditor";
import { TierRow } from "./TierRow";
import { UnplacedItems } from "./UnplacedItems";
import { DraggableItem } from "./DraggableItem";

const MOCK_ITEMS: TierItem[] = [
  { id: "item-1", name: "아이템 1", imageUrl: "" },
  { id: "item-2", name: "아이템 2", imageUrl: "" },
  { id: "item-3", name: "아이템 3", imageUrl: "" },
  { id: "item-4", name: "아이템 4", imageUrl: "" },
  { id: "item-5", name: "아이템 5", imageUrl: "" },
  { id: "item-6", name: "아이템 6", imageUrl: "" },
  { id: "item-7", name: "아이템 7", imageUrl: "" },
  { id: "item-8", name: "아이템 8", imageUrl: "" },
  { id: "item-9", name: "아이템 9", imageUrl: "" },
  { id: "item-10", name: "아이템 10", imageUrl: "" },
  { id: "item-11", name: "아이템 11", imageUrl: "" },
  { id: "item-12", name: "아이템 12", imageUrl: "" },
];

interface TierBoardProps {
  items?: TierItem[];
  exportRef?: RefObject<HTMLDivElement | null>;
}

export function TierBoard({ items, exportRef }: TierBoardProps) {
  const tierItems = items ?? MOCK_ITEMS;

  const itemsMap = useMemo(
    () => new Map(tierItems.map((item) => [item.id, item])),
    [tierItems]
  );

  const {
    rows,
    tierState,
    activeId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    addRow,
    removeRow,
    renameRow,
    changeRowColor,
    resetAll,
  } = useTierEditor({ items: tierItems });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeItem = activeId ? itemsMap.get(activeId) : null;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between" data-export-ignore>
        <h2 className="text-lg font-semibold text-foreground">티어 에디터</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => addRow("NEW", "#c0c0c0")}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent"
          >
            <Plus className="h-4 w-4" />
            행 추가
          </button>
          <button
            onClick={resetAll}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" />
            초기화
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {/* Tier rows - capture area for export */}
        <div ref={exportRef} className="overflow-hidden rounded-lg border border-border">
          {rows.map((row) => (
            <TierRow
              key={row.id}
              row={row}
              itemIds={tierState[row.id] ?? []}
              itemsMap={itemsMap}
              onRemove={removeRow}
              onRename={renameRow}
              onChangeColor={changeRowColor}
            />
          ))}
        </div>

        {/* Unplaced items */}
        <UnplacedItems
          itemIds={tierState.unplaced ?? []}
          itemsMap={itemsMap}
        />

        {/* Drag overlay */}
        <DragOverlay>
          {activeItem ? <DraggableItem item={activeItem} overlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
