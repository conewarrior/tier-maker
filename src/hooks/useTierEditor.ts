"use client";

import { useState, useCallback } from "react";
import type { DragStartEvent, DragEndEvent, DragOverEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type { TierItem, TierRowConfig, TierState } from "@/types/tier";
import { DEFAULT_TIER_ROWS } from "@/lib/constants";

interface UseTierEditorProps {
  items: TierItem[];
  initialRows?: TierRowConfig[];
}

export function useTierEditor({ items, initialRows }: UseTierEditorProps) {
  const [rows, setRows] = useState<TierRowConfig[]>(
    initialRows ?? [...DEFAULT_TIER_ROWS]
  );

  const [tierState, setTierState] = useState<TierState>(() => {
    const state: TierState = { unplaced: items.map((item) => item.id) };
    for (const row of initialRows ?? DEFAULT_TIER_ROWS) {
      state[row.id] = [];
    }
    return state;
  });

  const [activeId, setActiveId] = useState<string | null>(null);

  const findContainer = useCallback(
    (id: string): string | null => {
      // Check if it's a container id itself
      if (id in tierState) return id;
      // Find which container holds this item
      for (const [containerId, itemIds] of Object.entries(tierState)) {
        if (itemIds.includes(id)) return containerId;
      }
      return null;
    },
    [tierState]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeContainer = findContainer(String(active.id));
      const overId = String(over.id);
      const overContainer = findContainer(overId) ?? overId;

      if (!activeContainer || !overContainer || activeContainer === overContainer) return;

      setTierState((prev) => {
        const activeItems = [...prev[activeContainer]];
        const overItems = [...prev[overContainer]];
        const activeIndex = activeItems.indexOf(String(active.id));

        // Remove from old container
        activeItems.splice(activeIndex, 1);

        // Determine insert index in new container
        const overIndex = overItems.indexOf(overId);
        const newIndex = overIndex >= 0 ? overIndex : overItems.length;

        overItems.splice(newIndex, 0, String(active.id));

        return {
          ...prev,
          [activeContainer]: activeItems,
          [overContainer]: overItems,
        };
      });
    },
    [findContainer]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over) return;

      const activeContainer = findContainer(String(active.id));
      const overId = String(over.id);
      const overContainer = findContainer(overId) ?? overId;

      if (!activeContainer || !overContainer) return;

      if (activeContainer === overContainer) {
        const items = tierState[activeContainer];
        const activeIndex = items.indexOf(String(active.id));
        const overIndex = items.indexOf(overId);

        if (activeIndex !== overIndex && overIndex >= 0) {
          setTierState((prev) => ({
            ...prev,
            [activeContainer]: arrayMove(prev[activeContainer], activeIndex, overIndex),
          }));
        }
      }
    },
    [findContainer, tierState]
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  const addRow = useCallback(
    (name: string, color: string) => {
      const id = `custom-${Date.now()}`;
      setRows((prev) => [...prev, { id, name, color }]);
      setTierState((prev) => ({ ...prev, [id]: [] }));
    },
    []
  );

  const removeRow = useCallback((rowId: string) => {
    setRows((prev) => prev.filter((r) => r.id !== rowId));
    setTierState((prev) => {
      const { [rowId]: removedItems, ...rest } = prev;
      return {
        ...rest,
        unplaced: [...rest.unplaced, ...(removedItems ?? [])],
      };
    });
  }, []);

  const renameRow = useCallback((rowId: string, newName: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, name: newName } : r))
    );
  }, []);

  const changeRowColor = useCallback((rowId: string, newColor: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, color: newColor } : r))
    );
  }, []);

  const resetAll = useCallback(() => {
    setTierState((prev) => {
      const allItems = Object.values(prev).flat();
      const state: TierState = { unplaced: allItems };
      for (const row of rows) {
        state[row.id] = [];
      }
      return state;
    });
  }, [rows]);

  return {
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
  };
}
