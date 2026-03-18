import { zip, strToU8 } from "fflate";
import type { FilteredTweet } from "../types";
import { buildTxt } from "./format";
import { fetchImage, imageFilename } from "./imageUtils";

function toFolderName(text: string, fallback: string): string {
  const sanitized = text
    .replace(/[/\\:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!sanitized) return fallback;
  return sanitized.length > 50 ? sanitized.slice(0, 20).trimEnd() : sanitized;
}

export async function buildZip(
  tweets: FilteredTweet[],
  onProgress?: (ratio: number) => void,
): Promise<Blob> {
  const files: Record<string, Uint8Array> = {};
  const usedNames = new Map<string, number>();

  for (let i = 0; i < tweets.length; i++) {
    const tweet = tweets[i];

    let folderName = toFolderName(tweet.full_text, tweet.url.split("/").pop() ?? String(i));
    const count = usedNames.get(folderName) ?? 0;
    usedNames.set(folderName, count + 1);
    if (count > 0) folderName = `${folderName} (${count})`;

    // 텍스트
    files[`${folderName}/tweets.txt`] = strToU8(buildTxt(tweet));

    // 이미지 (루트 + 스레드 전체)
    const mediaUrls = [...tweet.media_urls, ...tweet.threads.flatMap((t) => t.media_urls)].filter(
      (v, idx, a) => a.indexOf(v) === idx,
    );

    await Promise.all(
      mediaUrls.map(async (url, idx) => {
        const data = await fetchImage(url);
        if (data) {
          files[`${folderName}/${imageFilename(url, idx)}`] = data;
        }
      }),
    );

    onProgress?.((i + 1) / tweets.length);
    await new Promise((r) => setTimeout(r, 0));
  }

  const zipData = await new Promise<Uint8Array>((resolve, reject) => {
    zip(files, { level: 6 }, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });

  return new Blob([zipData.buffer as ArrayBuffer], { type: "application/zip" });
}
