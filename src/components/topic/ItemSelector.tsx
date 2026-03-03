"use client";

import { Check } from "lucide-react";
import type { Item } from "@/types/tier";
import { cn } from "@/lib/utils";

interface ItemSelectorProps {
  items: Item[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function ItemSelector({ items, selectedIds, onChange }: ItemSelectorProps) {
  const toggleItem = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const selectAll = () => {
    onChange(items.map((i) => i.id));
  };

  const deselectAll = () => {
    onChange([]);
  };

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border px-6 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          이 소분류에 등록된 아이템이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {selectedIds.length}개 선택됨
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            전체 선택
          </button>
          <button
            type="button"
            onClick={deselectAll}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            전체 해제
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8">
        {items.map((item) => {
          const selected = selectedIds.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleItem(item.id)}
              className={cn(
                "relative flex flex-col items-center gap-1.5 rounded-md border p-2 transition-colors",
                selected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-accent"
              )}
            >
              {selected && (
                <div className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                  <Check className="h-2.5 w-2.5 text-primary-foreground" />
                </div>
              )}
              <div className="flex h-[48px] w-[48px] items-center justify-center overflow-hidden rounded bg-muted">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-muted" />
                )}
              </div>
              <span className="max-w-full truncate text-[10px] text-foreground">
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
