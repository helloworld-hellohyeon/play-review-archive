import { useCallback, useRef, useState } from "react";
import styled from "@emotion/styled";
import { filterTweets, loadJsOrJson, extractUsername } from "./utils/filter";
import { buildZip } from "./utils/archive";
import type { FilterOptions, FilterResult } from "./types";
import { DropZone } from "./components/DropZone";
import { FilterPanel } from "./components/FilterPanel";
import { HowToUse } from "./components/HowToUse";
import { ProgressBar } from "./components/ProgressBar";
import { StatsPanel } from "./components/StatsPanel";
import { GlobalStyle } from "./styles/GlobalStyle";
import { theme } from "./styles/theme";

type Phase = "idle" | "filtering" | "zipping" | "done" | "error";

const Container = styled.div`
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Subtitle = styled.h2`
  font-size: ${theme.fontSizes.lg};
  font-weight: 400;
  color: ${theme.colors.textStrong};
  text-align: center;
`;

const Title = styled.h1`
  font-size: ${theme.fontSizes["2xl"]};
  font-weight: 900;
  color: ${theme.colors.textStrong};
  text-align: center;
  margin-top: 8px;
`;

const PrimaryButton = styled.button`
  display: block;
  width: 100%;
  padding: 0.8rem;
  background: ${theme.colors.accent};
  color: white;
  border: none;
  border-radius: ${theme.radii.md};
  font-size: ${theme.fontSizes.md};
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.2s,
    opacity 0.2s;

  &:hover:not(:disabled) {
    background: ${theme.colors.accentHover};
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;

const DownloadButton = styled(PrimaryButton)`
  &:disabled {
    display: none;
  }
`;

const ResetButton = styled.button`
  width: 100%;
  padding: 0.65rem;
  background: transparent;
  color: ${theme.colors.textSubtle};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  font-size: ${theme.fontSizes.body};
  cursor: pointer;
  transition:
    color 0.2s,
    border-color 0.2s;

  &:hover {
    color: ${theme.colors.textMuted};
    border-color: ${theme.colors.borderHover};
  }
`;

const ErrorBox = styled.div`
  background: ${theme.colors.errorBg};
  border: 1px solid ${theme.colors.errorBorder};
  border-radius: ${theme.radii.md};
  padding: 0.75rem 1rem;
  font-size: ${theme.fontSizes.body};
  color: ${theme.colors.errorText};
`;

export default function App() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [stats, setStats] = useState<FilterResult | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [username, setUsername] = useState("");
  const [usernameReadOnly, setUsernameReadOnly] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    datePrefix: true,
    photoWithThread: true,
    keyword: "",
  });
  const zipBlobRef = useRef<Blob | null>(null);

  const hasFilterCondition =
    filterOptions.datePrefix || filterOptions.photoWithThread || filterOptions.keyword !== "";
  const canStart = pendingFiles.length > 0 && username.trim() !== "" && hasFilterCondition;

  const handleFiles = useCallback(async (files: File[]) => {
    setPendingFiles(files);
    setUsername("");
    setUsernameReadOnly(true);
    try {
      const allData = [];
      for (const file of files) {
        const raw = await file.text();
        allData.push(...loadJsOrJson(raw, file.name));
      }
      const detected = extractUsername(allData);
      if (detected) {
        setUsername(detected);
      } else {
        setUsernameReadOnly(false);
      }
    } catch {
      setUsernameReadOnly(false);
    }
  }, []);

  const processFile = useCallback(
    async (files: File[], currentUsername: string) => {
      setPhase("filtering");
      setProgress(0);
      setProgressLabel("파일 읽는 중...");
      setErrorMsg("");
      setStats(null);

      try {
        const allData = [];
        for (let fi = 0; fi < files.length; fi++) {
          const file = files[fi];
          setProgressLabel(`파일 읽는 중... (${fi + 1} / ${files.length})`);
          await tick();
          const raw = await file.text();
          let parsed;
          try {
            parsed = loadJsOrJson(raw, file.name);
          } catch (e) {
            throw new Error(`${file.name} 파싱 실패: ` + (e as Error).message);
          }
          allData.push(...parsed);
        }
        const data = allData;

        setProgress(0.1);
        setProgressLabel("파싱 중...");
        await tick();

        if (!Array.isArray(data) || data.length === 0) {
          throw new Error("유효한 트윗 배열을 찾을 수 없습니다.");
        }

        setProgress(0.15);
        setProgressLabel(`필터링 중... (@${currentUsername})`);
        await tick();

        const result = await filterTweets(data, currentUsername, filterOptions, (ratio) => {
          setProgress(0.15 + ratio * 0.5);
          setProgressLabel("필터링 중...");
        });

        setStats(result);

        setPhase("zipping");
        setProgress(0.65);
        setProgressLabel(`ZIP 생성 중... (0 / ${result.result.length})`);
        await tick();

        const zip = await buildZip(result.result, (ratio) => {
          const done = Math.round(ratio * result.result.length);
          setProgress(0.65 + ratio * 0.33);
          setProgressLabel(`ZIP 생성 중... (${done} / ${result.result.length})`);
        });

        setProgress(0.98);
        setProgressLabel("압축 완료, 다운로드 준비 중...");
        await tick();

        zipBlobRef.current = zip;
        setProgress(1);
        setPhase("done");
      } catch (e) {
        setErrorMsg((e as Error).message);
        setPhase("error");
      }
    },
    [filterOptions],
  );

  const handleStart = () => {
    if (canStart) processFile(pendingFiles, username.trim());
  };

  const handleDownload = () => {
    const blob = zipBlobRef.current;
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${username.trim()}_tweets_archive.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const reset = () => {
    zipBlobRef.current = null;
    setStats(null);
    setPhase("idle");
    setProgress(0);
    setErrorMsg("");
    setPendingFiles([]);
    setUsername("");
    setUsernameReadOnly(false);
  };

  const isIdle = phase === "idle" || phase === "error";
  const isProcessing = phase === "filtering" || phase === "zipping";

  return (
    <>
      <GlobalStyle />
      <Container>
        {phase !== "done" && (
          <Header>
            <Subtitle>필터링된 스레드를 폴더와 텍스트로 아카이브해요</Subtitle>
            <Title>이매지너리 🧩</Title>
          </Header>
        )}

        {isIdle && (
          <>
            <DropZone
              onFiles={handleFiles}
              files={pendingFiles}
              username={username}
              usernameReadOnly={usernameReadOnly}
              onUsernameChange={setUsername}
            />
            <FilterPanel options={filterOptions} onChange={setFilterOptions} />
            <PrimaryButton disabled={!canStart} onClick={handleStart}>
              아카이브 시작
            </PrimaryButton>
            <HowToUse />
          </>
        )}

        {isIdle && phase === "error" && <ErrorBox>{errorMsg}</ErrorBox>}

        {isProcessing && <ProgressBar label={progressLabel} progress={progress} />}

        {phase === "done" && stats && (
          <>
            <Header>
              <Subtitle>플레이어 원 준, 플레이어 투 @{username}</Subtitle>
              <Title>시스템 레디!</Title>
            </Header>

            <StatsPanel
              totalCount={stats.totalCount}
              rootCount={stats.rootCount}
              threadCount={stats.threadCount}
            />
            <DownloadButton onClick={handleDownload}>tweets_archive.zip 다운로드</DownloadButton>
            <ResetButton onClick={reset}>다시 처음으로</ResetButton>
          </>
        )}
      </Container>
    </>
  );
}

function tick() {
  return new Promise((r) => setTimeout(r, 0));
}
