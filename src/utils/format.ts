import type { FilteredTweet, ThreadTweet } from "../types";

/** "Mon Jan 01 00:00:00 +0000 2026" → "2026-01-01 00:00:00" */
export function formatDate(createdAt: string): string {
  const d = new Date(createdAt);
  if (isNaN(d.getTime())) return createdAt;
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ` +
    `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`
  );
}

export function buildTxt(root: FilteredTweet): string {
  const lines: string[] = [];

  lines.push(root.full_text);

  root.threads.forEach((t: ThreadTweet) => {
    lines.push("");
    lines.push(t.full_text);
  });

  return lines.join("\n");
}
