"use client";

import { useRef, useState, useCallback } from "react";
import { toPng } from "html-to-image";

interface UseExportImageOptions {
  filename: string;
}

export function useExportImage({ filename }: UseExportImageOptions) {
  const ref = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const exportAsPng = useCallback(async () => {
    if (!ref.current) return;

    setExporting(true);
    try {
      const dataUrl = await toPng(ref.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        filter: (node) => {
          if (node instanceof HTMLElement) {
            return !node.hasAttribute("data-export-ignore");
          }
          return true;
        },
      });

      const link = document.createElement("a");
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export image:", err);
    } finally {
      setExporting(false);
    }
  }, [filename]);

  return { ref, exporting, exportAsPng };
}
