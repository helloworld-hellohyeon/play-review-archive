import { memo, useCallback, useState } from "react";
import styled from "@emotion/styled";
import type { FilterResult } from "../../types";
import { buildZip } from "../../utils/archive";
import { StatsPanel } from "../StatsPanel";
import { Header, Subtitle, Title, PrimaryButton, ResetButton, Code } from "../Layout";
import { ProcessingShell } from "../ProcessingShell";
import { theme } from "../../styles/theme";

interface Props {
  stats: FilterResult;
  username: string;
  onReset: () => void;
}

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  max-height: 360px;
  overflow-y: scroll;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  padding: 0.25rem;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.border};
    border-radius: ${theme.radii.full};
  }
  &::-webkit-scrollbar-thumb:hover {
    background: ${theme.colors.borderHover};
  }
`;

const TweetRow = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.4rem 0.6rem;
  border-radius: ${theme.radii.md};
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: ${theme.colors.surface};
  }
`;

const Checkbox = styled.input`
  margin-top: 2px;
  accent-color: ${theme.colors.accent};
  flex-shrink: 0;
`;

const TweetInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
  flex: 1;
`;

const OpenButton = styled.button`
  flex-shrink: 0;
  align-self: center;
  padding: 0.25rem 0.6rem;
  background: transparent;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.sm};
  color: ${theme.colors.textMuted};
  font-size: ${theme.fontSizes.xs};
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;

  &:hover {
    color: ${theme.colors.text};
    border-color: ${theme.colors.borderHover};
  }
`;

const TweetText = styled.span`
  font-size: ${theme.fontSizes.body};
  color: ${theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TweetMeta = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const MetaDate = styled.span`
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.textSubtle};
`;

const Badge = styled.span`
  font-size: ${theme.fontSizes.xxs};
  color: ${theme.colors.textMuted};
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.full};
  padding: 0.1em 0.5em;
`;

const ImageStrip = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex-shrink: 0;
`;

const Thumb = styled.img`
  width: 44px;
  height: 44px;
  object-fit: cover;
  border-radius: ${theme.radii.sm};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.surface};
`;

const ToggleButton = styled.button`
  background: transparent;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  color: ${theme.colors.textMuted};
  font-size: ${theme.fontSizes.xs};
  padding: 0.3rem 0.75rem;
  cursor: pointer;
  align-self: flex-start;
  transition: color 0.15s, border-color 0.15s;

  &:hover {
    color: ${theme.colors.text};
    border-color: ${theme.colors.borderHover};
  }
`;

import type { FilteredTweet } from "../../types";

function stripTrailingUrl(text: string): string {
  return text.replace(/\s*https?:\/\/t\.co\/\S+$/g, "").trimEnd();
}

function formatDate(createdAt: string): string {
  const d = new Date(createdAt);
  if (isNaN(d.getTime())) return createdAt;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

interface RowProps {
  tweet: FilteredTweet;
  checked: boolean;
  onToggle: (url: string) => void;
}

const TweetItem = memo(function TweetItem({ tweet, checked, onToggle }: RowProps) {
  const clean = stripTrailingUrl(tweet.full_text);
  const totalMedia = tweet.media_urls.length + tweet.threads.reduce((s, t) => s + t.media_urls.length, 0);
  return (
    <TweetRow>
      <Checkbox
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(tweet.url)}
      />
      {tweet.media_urls.length > 0 && (
        <ImageStrip>
          {tweet.media_urls.map((src, i) => (
            <Thumb
              key={i}
              src={src.includes("pbs.twimg.com") ? `${src}${src.includes("?") ? "&" : "?"}name=small` : src}
              alt=""
              loading="lazy"
            />
          ))}
        </ImageStrip>
      )}
      <TweetInfo>
        <TweetText>{clean.slice(0, 50)}{clean.length > 50 ? "…" : ""}</TweetText>
        <TweetMeta>
          <MetaDate>{formatDate(tweet.created_at)}</MetaDate>
          {tweet.threads.length > 0 && <Badge>스레드 {tweet.threads.length}</Badge>}
          {totalMedia > 0 && <Badge>미디어 {totalMedia}</Badge>}
        </TweetMeta>
      </TweetInfo>
      <OpenButton
        onClick={(e) => { e.preventDefault(); window.open(tweet.url, "_blank", "noopener,noreferrer"); }}
      >
        열기
      </OpenButton>
    </TweetRow>
  );
});

export function Review({ stats, username, onReset }: Props) {
  const tweets = stats.result;
  const allUrls = tweets.map((t) => t.url);

  const [selected, setSelected] = useState<Set<string>>(new Set(allUrls));
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildLabel, setBuildLabel] = useState("");

  const allSelected = selected.size === tweets.length;

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allUrls));
    }
  };

  const toggleOne = useCallback((url: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
      } else {
        next.add(url);
      }
      return next;
    });
  }, []);

  const handleDownload = async () => {
    const selectedTweets = tweets.filter((t) => selected.has(t.url));
    if (selectedTweets.length === 0) return;

    setIsBuilding(true);
    setBuildProgress(0);
    setBuildLabel(`ZIP 생성 중... (0 / ${selectedTweets.length})`);

    try {
      const zip = await buildZip(selectedTweets, (ratio) => {
        const done = Math.round(ratio * selectedTweets.length);
        setBuildProgress(ratio);
        setBuildLabel(`ZIP 생성 중... (${done} / ${selectedTweets.length})`);
      });

      const url = URL.createObjectURL(zip);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${username}_tweets_archive.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } finally {
      setIsBuilding(false);
      setBuildProgress(0);
    }
  };

  if (isBuilding) {
    return <ProcessingShell label={buildLabel} progress={buildProgress} />;
  }

  return (
    <>
      <Header>
        <Subtitle>
          플레이어 원 준, 플레이어 투{" "}
          <Code>
            <b>@{username}</b>
          </Code>
        </Subtitle>
        <Title>시스템 레디!</Title>
      </Header>

      <StatsPanel
        totalCount={stats.totalCount}
        rootCount={stats.rootCount}
        threadCount={stats.threadCount}
        selectedCount={selected.size}
      />

      <ToggleButton onClick={toggleAll}>
        {allSelected ? "전체 해제" : "전체 선택"}
      </ToggleButton>

      <ListWrapper>
        {tweets.map((tweet) => (
          <TweetItem
            key={tweet.url}
            tweet={tweet}
            checked={selected.has(tweet.url)}
            onToggle={toggleOne}
          />
        ))}
      </ListWrapper>

      <PrimaryButton onClick={handleDownload} disabled={selected.size === 0}>
        {isBuilding ? "ZIP 생성 중..." : `선택한 ${selected.size}개 다운로드`}
      </PrimaryButton>

      <ResetButton onClick={onReset}>
        다시 처음으로
      </ResetButton>
    </>
  );
}
