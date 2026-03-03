"use client";

import { useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { ItemUploadForm } from "./ItemUploadForm";
import { ImageReplaceModal } from "./ImageReplaceModal";
import type { Item } from "@/types/tier";

interface ItemGridProps {
  items: Item[];
  subcategoryId: string;
  isLoggedIn: boolean;
}

export function ItemGrid({ items, subcategoryId, isLoggedIn }: ItemGridProps) {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [replaceTarget, setReplaceTarget] = useState<Item | null>(null);

  return (
    <div className="space-y-3">
      {/* 아이템 그리드 */}
      {items.length === 0 && !showUploadForm ? (
        <div className="rounded-lg border border-border px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            아직 등록된 아이템이 없습니다.
          </p>
          {isLoggedIn && (
            <button
              onClick={() => setShowUploadForm(true)}
              className="mt-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
              첫 아이템 추가하기
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col items-center gap-1.5 rounded-md border border-border p-2"
            >
              <div className="relative flex h-[56px] w-[56px] items-center justify-center overflow-hidden rounded bg-muted">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-muted" />
                )}
                {isLoggedIn && (
                  <button
                    onClick={() => setReplaceTarget(item)}
                    className={cn(
                      "absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity",
                      "group-hover:opacity-100"
                    )}
                    title="이미지 교체"
                  >
                    <RefreshCw className="h-4 w-4 text-white" />
                  </button>
                )}
              </div>
              <span className="max-w-full truncate text-xs text-foreground">
                {item.name}
              </span>
            </div>
          ))}

          {/* 추가 버튼 (그리드 마지막 칸) */}
          {isLoggedIn && !showUploadForm && (
            <button
              onClick={() => setShowUploadForm(true)}
              className="flex flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border p-2 text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors"
            >
              <div className="flex h-[56px] w-[56px] items-center justify-center">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-xs">추가</span>
            </button>
          )}
        </div>
      )}

      {/* 업로드 폼 */}
      {showUploadForm && (
        <ItemUploadForm
          subcategoryId={subcategoryId}
          onCancel={() => setShowUploadForm(false)}
        />
      )}

      {/* 이미지 교체 모달 */}
      {replaceTarget && (
        <ImageReplaceModal
          item={replaceTarget}
          open={!!replaceTarget}
          onOpenChange={(open) => {
            if (!open) setReplaceTarget(null);
          }}
        />
      )}
    </div>
  );
}
