import { Zip, ZipDeflate, ZipPassThrough, strToU8 } from "fflate";
import type { ExtractedThread } from "./types";
import { buildThreadTxt } from "./format";
import { fetchImage, imageFilename } from "./imageUtils";

function toFolderName(text: string, fallback: string): string {
  const sanitized = text
    .replace(/[/\\:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!sanitized) return fallback;
  return sanitized.length > 50 ? sanitized.slice(0, 30).trimEnd() : sanitized;
}

/**
 * 워커 풀 방식으로 이미지 병렬 fetch.
 * 배치 방식과 달리 슬롯이 비는 즉시 다음 URL을 시작하므로
 * 느린 이미지 한 장이 전체를 막지 않는다.
 */
async function fetchAllImages(
  urls: string[],
  concurrency: number,
  onProgress: (done: number, total: number) => void,
): Promise<(Uint8Array | null)[]> {
  const results: (Uint8Array | null)[] = new Array(urls.length).fill(null);
  let nextIdx = 0;
  let done = 0;

  async function worker() {
    while (nextIdx < urls.length) {
      const idx = nextIdx++;
      results[idx] = await fetchImage(urls[idx]);
      onProgress(++done, urls.length);
    }
  }

  const workerCount = Math.min(concurrency, urls.length);
  if (workerCount > 0) {
    await Promise.all(Array.from({ length: workerCount }, worker));
  }

  return results;
}

export async function buildZip(
  thread: ExtractedThread,
  onProgress?: (ratio: number) => void,
): Promise<Blob> {
  const chunks: Uint8Array[] = [];

  await new Promise<void>((resolve, reject) => {
    const zipStream = new Zip((err, data, final) => {
      if (err) { reject(err); return; }
      chunks.push(data);
      if (final) resolve();
    });

    (async () => {
      const { rootTweet, replies } = thread;
      const folderName = toFolderName(rootTweet.text, rootTweet.tweetId);

      // tweets.txt
      const txtEntry = new ZipDeflate(`${folderName}/tweets.txt`, { level: 6 });
      zipStream.add(txtEntry);
      txtEntry.push(strToU8(buildThreadTxt(thread)), true);

      // 미디어 URL 수집 (중복 제거)
      const seen = new Set<string>();
      const allMedia: string[] = [];
      for (const url of [rootTweet, ...replies].flatMap((t) => t.mediaUrls)) {
        if (!seen.has(url)) { seen.add(url); allMedia.push(url); }
      }

      if (allMedia.length === 0) {
        onProgress?.(1);
      } else {
        // 워커 풀로 전체 이미지 동시 fetch
        const imageData = await fetchAllImages(allMedia, 6, (done, total) => {
          onProgress?.(done / total);
        });

        for (let i = 0; i < allMedia.length; i++) {
          const data = imageData[i];
          if (data) {
            const imgEntry = new ZipPassThrough(`${folderName}/${imageFilename(allMedia[i], i)}`);
            zipStream.add(imgEntry);
            imgEntry.push(data, true);
          }
        }
      }

      zipStream.end();
    })().catch(reject);
  });

  return new Blob(chunks, { type: "application/zip" });
}
