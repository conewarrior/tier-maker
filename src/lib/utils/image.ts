/**
 * 클라이언트 이미지 리사이즈 + WebP 변환 유틸리티
 */

const MAX_SIZE = 200;
const BANNER_MAX_WIDTH = 1200;
const BANNER_MAX_HEIGHT = 400;

export async function resizeBannerToWebP(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);

  let width = bitmap.width;
  let height = bitmap.height;

  if (width > BANNER_MAX_WIDTH) {
    height = Math.round((height / width) * BANNER_MAX_WIDTH);
    width = BANNER_MAX_WIDTH;
  }
  if (height > BANNER_MAX_HEIGHT) {
    width = Math.round((width / height) * BANNER_MAX_HEIGHT);
    height = BANNER_MAX_HEIGHT;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("WebP 변환 실패"))),
      "image/webp",
      0.85
    );
  });

  return new File([blob], "banner.webp", { type: "image/webp" });
}

export async function resizeAndConvertToWebP(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);

  let width = bitmap.width;
  let height = bitmap.height;

  if (width > MAX_SIZE || height > MAX_SIZE) {
    if (width > height) {
      height = Math.round((height / width) * MAX_SIZE);
      width = MAX_SIZE;
    } else {
      width = Math.round((width / height) * MAX_SIZE);
      height = MAX_SIZE;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("WebP 변환 실패"))),
      "image/webp",
      0.85
    );
  });

  return new File([blob], "image.webp", { type: "image/webp" });
}
