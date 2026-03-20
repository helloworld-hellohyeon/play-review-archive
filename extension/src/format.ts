import type { ExtractedThread } from "./types";

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

export function buildThreadTxt(thread: ExtractedThread): string {
  const lines: string[] = [];

  lines.push(thread.rootTweet.text);

  for (const reply of thread.replies) {
    lines.push("");
    lines.push(reply.text);
  }

  return lines.join("\n");
}
