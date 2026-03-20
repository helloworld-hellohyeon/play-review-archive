import type {
  RawItem,
  RawTweet,
  ThreadTweet,
  FilteredTweet,
  FilterResult,
  FilterOptions,
} from "../types";

export function isYymmddPrefix(text: string): boolean {
  const sep = "[./\\-]?";
  // yyMMdd or yyyyMMdd, with optional separator between each part
  return new RegExp(
    `^(\\d{4}|\\d{2})${sep}(0[1-9]|1[0-2])${sep}(0[1-9]|[12]\\d|3[01])`,
  ).test(text);
}

export function loadJsOrJson(raw: string, filename: string): RawItem[] {
  if (filename.endsWith(".js")) {
    const start = raw.indexOf("[");
    if (start === -1) throw new Error("JS 파일에서 배열을 찾을 수 없습니다.");
    return JSON.parse(raw.slice(start)) as RawItem[];
  }
  return JSON.parse(raw) as RawItem[];
}

export function extractUsername(data: RawItem[]): string | null {
  // 1) media expanded_url 패턴
  const counts: Record<string, number> = {};
  for (const item of data) {
    const tweet = item.tweet;
    for (const m of tweet.extended_entities?.media ?? tweet.entities?.media ?? []) {
      const url = m.expanded_url ?? "";
      const match = url.match(/(?:twitter|x)\.com\/([^/]+)\/status\//);
      if (match) {
        const name = match[1].toLowerCase();
        counts[name] = (counts[name] ?? 0) + 1;
      }
    }
  }
  if (Object.keys(counts).length) {
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }

  // 2) in_reply_to_screen_name 빈도
  const repCounts: Record<string, number> = {};
  for (const item of data) {
    const name = item.tweet.in_reply_to_screen_name;
    if (name) repCounts[name] = (repCounts[name] ?? 0) + 1;
  }
  if (Object.keys(repCounts).length) {
    return Object.entries(repCounts).sort((a, b) => b[1] - a[1])[0][0];
  }

  return null;
}

function extractFields(tweet: RawTweet, username: string, includeUrl: true): FilteredTweet;
function extractFields(tweet: RawTweet, username: string, includeUrl?: false): ThreadTweet;
function extractFields(
  tweet: RawTweet,
  username: string,
  includeUrl = false,
): ThreadTweet | FilteredTweet {
  const mediaUrls = (tweet.extended_entities?.media ?? tweet.entities?.media ?? []).map(
    (m) => m.media_url_https,
  );
  const base: ThreadTweet = {
    full_text: tweet.full_text,
    created_at: tweet.created_at,
    media_urls: mediaUrls,
  };
  if (includeUrl) {
    return { ...base, url: `https://x.com/${username}/status/${tweet.id}`, threads: [] };
  }
  return base;
}

function collectThread(
  rootId: string,
  replyMap: Map<string, string[]>,
  idToItem: Map<string, RawItem>,
  username: string,
): ThreadTweet[] {
  const threadIds: string[] = [];
  const queue = [rootId];
  let qi = 0;
  while (qi < queue.length) {
    const currentId = queue[qi++];
    for (const childId of replyMap.get(currentId) ?? []) {
      threadIds.push(childId);
      queue.push(childId);
    }
  }
  const threadTweets = threadIds
    .filter((tid) => idToItem.has(tid))
    .map((tid) => idToItem.get(tid)!.tweet);
  threadTweets.sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
  return threadTweets.map((t) => extractFields(t, username));
}

const YIELD_INTERVAL = 15000;

export async function filterTweets(
  data: RawItem[],
  username: string,
  options: FilterOptions,
  onProgress: (ratio: number) => void,
): Promise<FilterResult> {
  const deduped = new Map<string, RawItem>();
  for (const item of data) {
    deduped.set(item.tweet.id, item);
  }
  const uniqueData = [...deduped.values()].filter(
    (item) => !item.tweet.full_text.startsWith("RT @"),
  );

  const idToItem = new Map<string, RawItem>();
  for (const item of uniqueData) {
    idToItem.set(item.tweet.id, item);
  }

  // reply map
  const replyMap = new Map<string, string[]>();
  for (const [tweetId, item] of idToItem) {
    const parentId = item.tweet.in_reply_to_status_id;
    if (parentId) {
      if (!replyMap.has(parentId)) replyMap.set(parentId, []);
      replyMap.get(parentId)!.push(tweetId);
    }
  }

  const hasMedia = (tweet: RawTweet) =>
    ((tweet.extended_entities?.media ?? tweet.entities?.media)?.length ?? 0) > 0;

  const keywords = options.keyword
    .split(",")
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean);

  // root IDs — protectedRoots: matched by condition 1 or 3 (no thread-count limit)
  const rootIds = new Set<string>();
  const protectedRoots = new Set<string>();
  let i = 0;
  for (const [tweetId, item] of idToItem) {
    const tweet = item.tweet;
    const text = tweet.full_text ?? "";
    const isStandalone = !tweet.in_reply_to_status_id;
    const hasThread = replyMap.has(tweetId);

    // 부모가 데이터셋에 존재하는 리플은 루트가 될 수 없음 (부모 스레드에 포함됨)
    const parentExists = tweet.in_reply_to_status_id
      ? idToItem.has(tweet.in_reply_to_status_id)
      : false;

    const matchDatePrefix = options.datePrefix && isYymmddPrefix(text) && !parentExists;
    const matchPhotoThread =
      options.photoWithThread && isStandalone && hasMedia(tweet) && hasThread;
    const textLower = keywords.length > 0 ? text.toLowerCase() : "";
    const matchKeyword =
      keywords.length > 0 && keywords.some((kw) => textLower.includes(kw)) && !parentExists;

    if (matchDatePrefix || matchPhotoThread || matchKeyword) {
      rootIds.add(tweetId);
    }
    if (matchDatePrefix || matchKeyword) {
      protectedRoots.add(tweetId);
    }
    i++;
    if (i % YIELD_INTERVAL === 0) {
      onProgress((i / uniqueData.length) * 0.5);
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  // sort roots
  const rootTweets = [...rootIds]
    .map((rid) => idToItem.get(rid)!.tweet)
    .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));

  const result: FilteredTweet[] = [];
  let totalThreadCount = 0;
  let j = 0;
  for (const rootTweet of rootTweets) {
    const threads = collectThread(rootTweet.id, replyMap, idToItem, username);
    // apply thread-count limit only for condition 2 exclusive matches
    if (!protectedRoots.has(rootTweet.id) && threads.length < 2) {
      j++;
      continue;
    }
    totalThreadCount += threads.length;
    const item = extractFields(rootTweet, username, true);
    item.threads = threads;
    result.push(item);
    j++;
    if (j % 100 === 0) {
      onProgress(0.5 + (j / rootTweets.length) * 0.5);
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  return {
    result,
    totalCount: uniqueData.length,
    rootCount: rootIds.size,
    threadCount: totalThreadCount,
    username,
  };
}
