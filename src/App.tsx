import { useCallback, useRef, useState } from "react";
import { filterTweets, loadJsOrJson } from "./utils/filter";
import { buildZip } from "./utils/archive";
import type { FilterOptions, FilterResult } from "./types";
import { DropZone } from "./components/DropZone";
import { FilterPanel } from "./components/FilterPanel";
import { HowToUse } from "./components/HowToUse";
import { ProgressBar } from "./components/ProgressBar";
import { StatsPanel } from "./components/StatsPanel";
import "./static/App.css";

type Phase = "idle" | "filtering" | "zipping" | "done" | "error";

export default function App() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [stats, setStats] = useState<FilterResult | null>(null);
  const [manualUsername, setManualUsername] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    datePrefix: true,
    photoWithThread: true,
    keyword: "",
  });
  const zipBlobRef = useRef<Blob | null>(null);

  const hasFilterCondition =
    filterOptions.datePrefix || filterOptions.photoWithThread || filterOptions.keyword !== "";
  const canStart = pendingFiles.length > 0 && manualUsername.trim() !== "" && hasFilterCondition;

  const processFile = useCallback(
    async (files: File[]) => {
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

        setProgress(0.05);
        setProgressLabel("파싱 중...");
        await tick();

        if (!Array.isArray(data) || data.length === 0) {
          throw new Error("유효한 트윗 배열을 찾을 수 없습니다.");
        }

        setProgress(0.1);
        setProgressLabel("유저네임 감지 중...");
        await tick();

        const username = manualUsername.trim();

        setProgress(0.15);
        setProgressLabel(`필터링 중... (유저: ${username})`);
        await tick();

        const result = await filterTweets(data, username, filterOptions, (ratio) => {
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
    [manualUsername, filterOptions],
  );

  const handleStart = () => {
    if (pendingFiles.length > 0 && canStart) processFile(pendingFiles);
  };

  const handleDownload = () => {
    const blob = zipBlobRef.current;
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tweets_archive.zip";
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
    setManualUsername("");
    setPendingFiles([]);
  };

  const isIdle = phase === "idle" || phase === "error";
  const isProcessing = phase === "filtering" || phase === "zipping";

  return (
    <div className="container">
      <div>
        <h2>필터링된 스레드를 폴더와 텍스트로 아카이브해요</h2>
        <h1>이매지너리 🧩</h1>
      </div>

      {isIdle && (
        <>
          <DropZone
            onFiles={setPendingFiles}
            files={pendingFiles}
            username={manualUsername}
            onUsernameChange={setManualUsername}
          />
          <FilterPanel options={filterOptions} onChange={setFilterOptions} />
          <button className="start-btn" disabled={!canStart} onClick={handleStart}>
            아카이브 시작
          </button>
          <HowToUse />
        </>
      )}

      {isIdle && phase === "error" && <div className="error-box">{errorMsg}</div>}

      {isProcessing && <ProgressBar label={progressLabel} progress={progress} />}

      {phase === "done" && stats && (
        <>
          <StatsPanel
            totalCount={stats.totalCount}
            rootCount={stats.rootCount}
            threadCount={stats.threadCount}
          />
          <button className="download-btn" onClick={handleDownload}>
            tweets_archive.zip 다운로드
          </button>
          <button className="reset-btn" onClick={reset}>
            다시 처음으로
          </button>
        </>
      )}
    </div>
  );
}

function tick() {
  return new Promise((r) => setTimeout(r, 0));
}
