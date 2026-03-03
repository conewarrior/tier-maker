"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2 } from "lucide-react";
import { replaceItemImage } from "@/app/actions/item";
import { resizeAndConvertToWebP } from "@/lib/utils/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Item } from "@/types/tier";

interface ImageReplaceModalProps {
  item: Item;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageReplaceModal({
  item,
  open,
  onOpenChange,
}: ImageReplaceModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setError(null);
    setSubmitting(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setError("이미지 파일만 업로드 가능합니다.");
      return;
    }

    setFile(selected);
    setError(null);

    const url = URL.createObjectURL(selected);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(url);
  };

  const handleSubmit = async () => {
    if (!file) return;

    setError(null);
    setSubmitting(true);

    try {
      const processed = await resizeAndConvertToWebP(file);
      const result = await replaceItemImage(item.id, processed);

      if (result.error) {
        setError(result.error);
        setSubmitting(false);
        return;
      }

      router.refresh();
      handleOpenChange(false);
    } catch {
      setError("이미지 교체에 실패했습니다.");
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>이미지 교체 - {item.name}</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4 py-2">
          {/* 현재 이미지 */}
          <div className="space-y-1 text-center">
            <div className="flex h-[80px] w-[80px] items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
              <img
                src={item.image_url}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-xs text-muted-foreground">현재</span>
          </div>

          <span className="text-muted-foreground">→</span>

          {/* 새 이미지 선택 */}
          <div className="space-y-1 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "flex h-[80px] w-[80px] items-center justify-center rounded-md border-2 border-dashed border-border overflow-hidden",
                "hover:border-foreground/30 transition-colors",
                preview && "border-solid border-border"
              )}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="새 이미지"
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImagePlus className="h-6 w-6 text-muted-foreground" />
              )}
            </button>
            <span className="text-xs text-muted-foreground">
              {preview ? "변경" : "선택"}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenChange(false)}
          >
            취소
          </Button>
          <Button
            size="sm"
            disabled={submitting || !file}
            onClick={handleSubmit}
          >
            {submitting ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                교체 중...
              </span>
            ) : (
              "교체"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
