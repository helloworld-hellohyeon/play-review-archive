/** 이미지 fetch — CORS 실패 시 null 반환 */
export async function fetchImage(url: string): Promise<Uint8Array | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    return new Uint8Array(buf);
  } catch {
    return null;
  }
}

/** URL에서 파일명 추출 (pbs.twimg.com의 format/name 쿼리 파라미터 처리 포함) */
export function imageFilename(url: string, index: number): string {
  try {
    const u = new URL(url);
    const base = u.pathname.split("/").pop() ?? `image_${index}`;
    const format = u.searchParams.get("format");
    // base에 확장자가 없으면 format 파라미터로 보완
    if (format && !base.includes(".")) {
      return `${base}.${format}`;
    }
    return base || `image_${index}`;
  } catch {
    return `image_${index}`;
  }
}
