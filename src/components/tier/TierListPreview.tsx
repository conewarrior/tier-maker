import Link from "next/link";
import { Heart, User } from "lucide-react";
import type { TierListWithRankings } from "@/types/tier";
import { DEFAULT_TIER_ROWS } from "@/lib/constants";

interface TierListPreviewProps {
  tierList: TierListWithRankings;
  href: string;
}

export function TierListPreview({ tierList, href }: TierListPreviewProps) {
  // Group rankings by tier
  const tierGroups: Record<string, typeof tierList.rankings> = {};
  for (const ranking of tierList.rankings) {
    if (!tierGroups[ranking.tier]) {
      tierGroups[ranking.tier] = [];
    }
    tierGroups[ranking.tier].push(ranking);
  }

  // Get color for a tier
  const getTierColor = (tier: string) => {
    const row = DEFAULT_TIER_ROWS.find((r) => r.name === tier);
    return row?.color ?? "#c0c0c0";
  };

  return (
    <Link
      href={href}
      className="block rounded-lg border border-border transition-colors hover:bg-accent/30"
    >
      {/* Mini tier preview */}
      <div className="overflow-hidden rounded-t-lg">
        {DEFAULT_TIER_ROWS.slice(0, 3).map((row) => {
          const items = tierGroups[row.name] ?? [];
          return (
            <div key={row.id} className="flex min-h-[32px] border-b border-border last:border-b-0">
              <div
                className="flex w-[40px] shrink-0 items-center justify-center border-r border-border text-xs font-bold"
                style={{ backgroundColor: row.color }}
              >
                {row.name}
              </div>
              <div className="flex flex-1 flex-wrap items-center gap-0.5 px-1 py-0.5">
                {items.slice(0, 8).map((ranking) => (
                  <div
                    key={ranking.id}
                    className="flex h-[28px] w-[28px] items-center justify-center overflow-hidden rounded-sm bg-muted"
                  >
                    {ranking.item?.image_url ? (
                      <img
                        src={ranking.item.image_url}
                        alt={ranking.item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted" />
                    )}
                  </div>
                ))}
                {items.length > 8 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{items.length - 8}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {Object.keys(tierGroups).length > 3 && (
          <div className="border-t border-border bg-muted/50 py-0.5 text-center text-[10px] text-muted-foreground">
            ...
          </div>
        )}
      </div>

      {/* Author info */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-1.5">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
            {tierList.user?.avatar_url ? (
              <img
                src={tierList.user.avatar_url}
                alt=""
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <User className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
          <span className="text-xs text-foreground">
            {tierList.user?.nickname ?? "익명"}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(tierList.created_at).toLocaleDateString("ko-KR")}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Heart className="h-3 w-3" />
          <span>{tierList.like_count}</span>
        </div>
      </div>
    </Link>
  );
}
