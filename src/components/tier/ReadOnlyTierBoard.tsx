"use client";

import { useRef } from "react";
import { useExportImage } from "@/hooks/useExportImage";
import { Download, Loader2 } from "lucide-react";

interface TierRowData {
  name: string;
  color: string;
  items: Array<{
    id: string;
    name: string | null;
    image_url: string | null;
  }>;
}

interface ReadOnlyTierBoardProps {
  rows: TierRowData[];
  topicTitle: string;
}

export function ReadOnlyTierBoard({ rows, topicTitle }: ReadOnlyTierBoardProps) {
  const { ref, exporting, exportAsPng } = useExportImage({
    filename: `sisiduck-tier-${topicTitle}`,
  });

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={exportAsPng}
          disabled={exporting}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50"
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          PNG로 저장
        </button>
      </div>

      <div ref={ref} className="overflow-hidden rounded-lg border border-border">
        {rows.map((row) => (
          <div
            key={row.name}
            className="flex min-h-[80px] border-b border-border last:border-b-0"
          >
            <div
              className="flex w-[100px] shrink-0 items-center justify-center border-r border-border text-lg font-bold text-foreground"
              style={{ backgroundColor: row.color }}
            >
              {row.name}
            </div>
            <div className="flex flex-1 flex-wrap items-start gap-1 p-2">
              {row.items.map((item) => (
                <div
                  key={item.id}
                  className="flex h-[72px] w-[72px] shrink-0 flex-col items-center justify-center gap-1 rounded-md border border-border p-1"
                >
                  <div className="flex h-[44px] w-[44px] items-center justify-center overflow-hidden rounded bg-muted">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name ?? ""}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted" />
                    )}
                  </div>
                  <span className="max-w-full truncate text-[10px] leading-tight text-foreground">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
