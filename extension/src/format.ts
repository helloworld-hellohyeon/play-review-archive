import type { ArchiveOptions, ExtractedThread } from "./types";

/** ISO 날짜 문자열 → "2026-01-01 00:00:00" */
export function formatDate(createdAt: string): string {
  const d = new Date(createdAt);
  if (isNaN(d.getTime())) return createdAt;
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ` +
    `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`
  );
}

const SEP = "=".repeat(30);

export function buildThreadTxt(thread: ExtractedThread, options: Pick<ArchiveOptions, "includeAuthor">): string {
  const lines: string[] = [];

  // 헤더
  lines.push(SEP);
  lines.push(formatDate(thread.rootTweet.createdAt));
  lines.push(thread.rootTweet.tweetUrl);
  lines.push(SEP);
  lines.push("");

  // 본문
  const all = [thread.rootTweet, ...thread.replies];
  for (let i = 0; i < all.length; i++) {
    const tweet = all[i];
    if (i > 0) lines.push("");
    if (options.includeAuthor) lines.push(`@${tweet.username}`);
    lines.push(tweet.text);
  }

  return lines.join("\n");
}
