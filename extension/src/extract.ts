import type { ExtractedTweet, ExtractedThread } from "./types";

function parseStatusUrl(url: string): { username: string; rootId: string } | null {
  const m = url.match(/https?:\/\/(?:twitter|x)\.com\/([^/]+)\/status\/(\d+)/);
  if (!m) return null;
  return { username: m[1], rootId: m[2] };
}

function parseTweetUrl(href: string): { tweetId: string; tweetUsername: string } | null {
  const m = href.match(/https?:\/\/(?:twitter|x)\.com\/([^/]+)\/status\/(\d+)/);
  if (!m) return null;
  return { tweetUsername: m[1], tweetId: m[2] };
}

function extractTweetFromArticle(article: Element): ExtractedTweet | null {
  const timeEl = article.querySelector("time");
  if (!timeEl) return null;

  const createdAt = timeEl.getAttribute("datetime") ?? "";
  const linkEl = timeEl.closest("a");
  if (!linkEl) return null;

  const href = linkEl.getAttribute("href") ?? "";
  const fullHref = href.startsWith("http") ? href : `https://x.com${href}`;
  const parsed = parseTweetUrl(fullHref);
  if (!parsed) return null;

  const textEl = article.querySelector('[data-testid="tweetText"]');
  const text = textEl?.textContent ?? "";

  // 원본 URL 그대로 저장 (캐시 히트를 위해 쿼리 파라미터 유지)
  const mediaSet = new Set<string>();
  for (const img of article.querySelectorAll('img[src*="pbs.twimg.com/media"]')) {
    const src = img.getAttribute("src");
    if (src) mediaSet.add(src);
  }

  return {
    tweetId: parsed.tweetId,
    tweetUrl: fullHref,
    username: parsed.tweetUsername,
    createdAt,
    text,
    mediaUrls: [...mediaSet],
  };
}

/** "답글 더보기" / "Show more replies" 버튼 클릭 — article 내부 버튼은 제외 */
function clickShowMoreButtons(): void {
  const buttons = document.querySelectorAll('[role="button"]');
  for (const btn of buttons) {
    if (btn.closest("article")) continue;
    const text = btn.textContent?.trim() ?? "";
    if (/답글 보기|더 많은 답글|Show more replies/i.test(text)) {
      (btn as HTMLElement).click();
    }
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** 현재 DOM의 모든 tweet article을 수집해 map에 누적 */
function collectVisible(map: Map<string, ExtractedTweet>): void {
  for (const article of document.querySelectorAll('article[data-testid="tweet"]')) {
    const tweet = extractTweetFromArticle(article);
    if (tweet && !map.has(tweet.tweetId)) {
      map.set(tweet.tweetId, tweet);
    }
  }
}

/**
 * 스레드 전체 로드 후 추출.
 * - 스크롤하며 트윗을 누적 수집 (가상 스크롤 대응)
 * - "더 보기" / "Show more replies" 버튼 자동 클릭
 * - 3라운드 연속으로 새 트윗이 없으면 종료
 */
export async function loadAndExtractThread(
  onProgress?: (loaded: number) => void,
): Promise<ExtractedThread | null> {
  const pageInfo = parseStatusUrl(location.href);
  if (!pageInfo) return null;
  const { username, rootId } = pageInfo;

  const collected = new Map<string, ExtractedTweet>();
  let stableRounds = 0;
  const MAX_STABLE = 3;
  const MAX_SCROLLS = 60; // 무한루프 방지
  let scrollCount = 0;

  // 초기 수집
  collectVisible(collected);
  onProgress?.(collected.size);

  while (stableRounds < MAX_STABLE && scrollCount < MAX_SCROLLS) {
    const prevSize = collected.size;

    clickShowMoreButtons();
    await sleep(600);
    collectVisible(collected);

    window.scrollBy(0, window.innerHeight * 0.85);
    await sleep(900);
    collectVisible(collected);

    if (collected.size === prevSize) {
      stableRounds++;
    } else {
      stableRounds = 0;
    }

    onProgress?.(collected.size);
    scrollCount++;
  }

  // tweetId 기준으로 정렬 (숫자 오름차순 = 시간순)
  const tweets = [...collected.values()].sort((a, b) =>
    a.tweetId.localeCompare(b.tweetId, undefined, { numeric: true }),
  );

  const rootIndex = tweets.findIndex((t) => t.tweetId === rootId);
  const startIndex = rootIndex >= 0 ? rootIndex : 0;

  const rootTweet = tweets[startIndex];
  if (!rootTweet) return null;

  const replies = tweets.slice(startIndex + 1).filter(
    (t) => t.username.toLowerCase() === username.toLowerCase(),
  );

  return { rootTweet, replies };
}
