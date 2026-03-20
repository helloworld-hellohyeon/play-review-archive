import { Zip, ZipDeflate, ZipPassThrough, strToU8 } from "fflate";
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
  const chunks: Uint8Array[] = [];
  const usedNames = new Map<string, number>();

  await new Promise<void>((resolve, reject) => {
    const zipStream = new Zip((err, data, final) => {
      if (err) { reject(err); return; }
      chunks.push(data);
      if (final) resolve();
    });

    (async () => {
      for (let i = 0; i < tweets.length; i++) {
        const tweet = tweets[i];

        let folderName = toFolderName(tweet.full_text, tweet.url.split("/").pop() ?? String(i));
        const count = usedNames.get(folderName) ?? 0;
        usedNames.set(folderName, count + 1);
        if (count > 0) folderName = `${folderName} (${count})`;

        // 텍스트 (압축)
        const txtEntry = new ZipDeflate(`${folderName}/tweets.txt`, { level: 6 });
        zipStream.add(txtEntry);
        txtEntry.push(strToU8(buildTxt(tweet)), true);

        // 이미지 (이미 압축된 포맷이므로 저장만)
        const mediaUrls = [...tweet.media_urls, ...tweet.threads.flatMap((t) => t.media_urls)].filter(
          (v, idx, a) => a.indexOf(v) === idx,
        );

        for (let idx = 0; idx < mediaUrls.length; idx++) {
          const data = await fetchImage(mediaUrls[idx]);
          if (data) {
            const imgEntry = new ZipPassThrough(`${folderName}/${imageFilename(mediaUrls[idx], idx)}`);
            zipStream.add(imgEntry);
            imgEntry.push(data, true);
            // data는 스트림에 쓰인 후 GC 가능
          }
        }

        onProgress?.((i + 1) / tweets.length);
        await new Promise((r) => setTimeout(r, 0));
      }

      zipStream.end();
    })().catch(reject);
  });

  return new Blob(chunks, { type: "application/zip" });
}
