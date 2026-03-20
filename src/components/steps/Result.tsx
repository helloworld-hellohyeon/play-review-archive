import type { FilterResult } from "../../types";
import { StatsPanel } from "../StatsPanel";
import { Header, Subtitle, Title, DownloadButton, ResetButton, Code } from "../Layout";

interface Props {
  stats: FilterResult;
  username: string;
  zip: Blob;
  onReset: () => void;
}

export function Result({ stats, username, zip, onReset }: Props) {
  const handleDownload = () => {
    const url = URL.createObjectURL(zip);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${username}_tweets_archive.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

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
      />
      <DownloadButton onClick={handleDownload}>tweets_archive.zip 다운로드</DownloadButton>
      <ResetButton onClick={onReset}>다시 처음으로</ResetButton>
    </>
  );
}
