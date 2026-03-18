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

/** URL에서 파일명 추출 (pbs.twimg.com의 format 쿼리 파라미터 처리 포함) */
export function imageFilename(url: string, index: number): string {
  try {
    const pathname = new URL(url).pathname;
    const base = pathname.split("/").pop() ?? `image_${index}`;
    const formatMatch = url.match(/[?&]format=(\w+)/);
    if (formatMatch && !base.includes(".")) {
      return `${base}.${formatMatch[1]}`;
    }
    return base || `image_${index}`;
  } catch {
    return `image_${index}`;
  }
}
