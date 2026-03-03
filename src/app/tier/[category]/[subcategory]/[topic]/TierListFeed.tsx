"use client";

import { useState } from "react";
import type { TierListWithRankings } from "@/types/tier";
import { TierListPreview } from "@/components/tier/TierListPreview";
import { cn } from "@/lib/utils";

interface TierListFeedProps {
  tierLists: TierListWithRankings[];
  topicId: string;
  basePath: string;
}

type SortTab = "latest" | "popular";

export function TierListFeed({ tierLists, basePath }: TierListFeedProps) {
  const [activeTab, setActiveTab] = useState<SortTab>("latest");

  const sorted = [...tierLists].sort((a, b) => {
    if (activeTab === "popular") {
      return b.like_count - a.like_count;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">티어리스트</h2>
        <div className="flex gap-1 rounded-md border border-border p-0.5">
          {(["latest", "popular"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-sm px-3 py-1 text-xs font-medium transition-colors",
                activeTab === tab
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab === "latest" ? "최신순" : "인기순"}
            </button>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-lg border border-border px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            아직 만들어진 티어리스트가 없습니다. 첫 번째로 만들어보세요!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {sorted.map((tierList) => (
            <TierListPreview
              key={tierList.id}
              tierList={tierList}
              href={`${basePath}/${tierList.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
