/**
 * 텍스트 정규화 - 소분류 중복 방지용
 * 공백, 하이픈, 언더스코어, 점 제거 + 특수문자 제거 (한글 유지) + 소문자 변환
 *
 * "ONE PIECE" → "onepiece"
 * "원 피스" → "원피스"
 */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s\-_.]/g, "")
    .replace(/[^\w\uAC00-\uD7AF]/g, "");
}
