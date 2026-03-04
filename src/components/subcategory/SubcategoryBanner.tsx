"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { resizeBannerToWebP } from "@/lib/utils/image";
import { updateSubcategoryBanner } from "@/app/actions/subcategory";

interface SubcategoryBannerProps {
  subcategoryId: string;
  bannerImageUrl: string | null;
  isLoggedIn: boolean;
}

export function SubcategoryBanner({
  subcategoryId,
  bannerImageUrl,
  isLoggedIn,
}: SubcategoryBannerProps) {
  const [imageUrl, setImageUrl] = useState(bannerImageUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const webpFile = await resizeBannerToWebP(file);

      const formData = new FormData();
      formData.append("image", webpFile);

      const result = await updateSubcategoryBanner(subcategoryId, webpFile);

      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setImageUrl(result.data.banner_image_url);
      }
    } catch {
      setError("이미지 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-1">
      <div className="group relative overflow-hidden rounded-lg border border-border">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="h-[200px] w-full object-cover"
          />
        ) : (
          <div className="flex h-[200px] w-full items-center justify-center bg-muted/50" />
        )}

        {isLoggedIn && (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100"
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            ) : (
              <span className="flex items-center gap-1.5 rounded-md bg-white/90 px-3 py-1.5 text-sm font-medium text-foreground">
                <ImagePlus className="h-4 w-4" />
                {imageUrl ? "이미지 변경" : "배너 이미지 추가"}
              </span>
            )}
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
