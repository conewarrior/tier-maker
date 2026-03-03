/**
 * 한글/영문 URL 슬러그 생성
 *
 * 영문: 소문자 + 하이픈
 * 한글: 그대로 유지 + 공백은 하이픈으로
 * 특수문자 제거, 연속 하이픈 정리
 */
export function generateSlug(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s\uAC00-\uD7AF-]/g, "") // 영문, 숫자, 한글, 공백, 하이픈만 허용
    .replace(/[\s_]+/g, "-") // 공백/언더스코어 → 하이픈
    .replace(/-+/g, "-") // 연속 하이픈 정리
    .replace(/^-|-$/g, ""); // 앞뒤 하이픈 제거
}
