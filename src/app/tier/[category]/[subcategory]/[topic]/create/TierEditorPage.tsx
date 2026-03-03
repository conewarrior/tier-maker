"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import type { TierItem } from "@/types/tier";
import { TierBoard } from "@/components/tier/TierBoard";
import { saveTierList } from "@/app/actions/tier";
import { useTierEditor } from "@/hooks/useTierEditor";
import { useExportImage } from "@/hooks/useExportImage";

interface TierEditorPageProps {
  topicId: string;
  topicTitle: string;
  items: TierItem[];
  backHref: string;
}

export function TierEditorPage({
  topicId,
  topicTitle,
  items,
  backHref,
}: TierEditorPageProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { rows, tierState } = useTierEditor({ items });
  const { ref: exportRef, exporting, exportAsPng } = useExportImage({
    filename: `sisiduck-tier-${topicTitle}`,
  });

  const handleSave = async () => {
    setError(null);
    setSaving(true);

    // Build rankings from tierState
    const rankings: { itemId: string; tier: string; position: number }[] = [];
    for (const row of rows) {
      const itemIds = tierState[row.id] ?? [];
      itemIds.forEach((itemId, index) => {
        rankings.push({ itemId, tier: row.name, position: index });
      });
    }

    const result = await saveTierList({ topicId, rankings });

    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    router.push(backHref);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="flex items-center justify-center rounded-md border border-border p-1.5 hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-foreground">{topicTitle}</h1>
            <p className="text-xs text-muted-foreground">
              아이템을 드래그해서 티어를 배치하세요
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportAsPng}
            disabled={exporting}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            PNG로 저장
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            저장
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <TierBoard items={items} exportRef={exportRef} />
    </div>
  );
}
