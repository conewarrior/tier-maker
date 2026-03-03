"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, X } from "lucide-react";
import { addItem } from "@/app/actions/item";
import { resizeAndConvertToWebP } from "@/lib/utils/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ItemUploadFormProps {
  subcategoryId: string;
  onCancel: () => void;
}

export function ItemUploadForm({ subcategoryId, onCancel }: ItemUploadFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setPreview(url);
  };

  const clearFile = () => {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name.trim()) return;

    setError(null);
    setSubmitting(true);

    try {
      const processed = await resizeAndConvertToWebP(file);
      const result = await addItem({
        subcategoryId,
        name: name.trim(),
        imageFile: processed,
      });

      if (result.error) {
        setError(result.error);
        setSubmitting(false);
        return;
      }

      router.refresh();
      onCancel();
    } catch {
      setError("아이템 추가에 실패했습니다.");
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-border p-4 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">아이템 추가</h3>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        {/* 이미지 선택 영역 */}
        <div className="shrink-0">
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
                alt="미리보기"
                className="h-full w-full object-cover"
              />
            ) : (
              <ImagePlus className="h-6 w-6 text-muted-foreground" />
            )}
          </button>
          {file && (
            <button
              type="button"
              onClick={clearFile}
              className="mt-1 block w-full text-center text-xs text-muted-foreground hover:text-foreground"
            >
              삭제
            </button>
          )}
        </div>

        {/* 이름 입력 */}
        <div className="flex-1 space-y-2">
          <Label htmlFor="item-name">이름</Label>
          <Input
            id="item-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="아이템 이름"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          취소
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={submitting || !file || !name.trim()}
        >
          {submitting ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              추가 중...
            </span>
          ) : (
            "추가"
          )}
        </Button>
      </div>
    </form>
  );
}
