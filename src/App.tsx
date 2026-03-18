import { useCallback, useRef, useState } from "react";
import { filterTweets, extractUsername, loadJsOrJson } from "./filter";
import { buildZip } from "./archive";
import type { FilterResult } from "./types";
import { DropZone } from "./components/DropZone";
import { ProgressBar } from "./components/ProgressBar";
import { StatsPanel } from "./components/StatsPanel";
import "./App.css";

type Phase = "idle" | "filtering" | "zipping" | "done" | "error";

export default function App() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [stats, setStats] = useState<FilterResult | null>(null);
  const [manualUsername, setManualUsername] = useState("");
  const zipBlobRef = useRef<Blob | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setPhase("filtering");
      setProgress(0);
      setProgressLabel("파일 읽는 중...");
      setErrorMsg("");
      setStats(null);

      try {
        const raw = await file.text();
        setProgress(0.05);
        setProgressLabel("파싱 중...");
        await tick();

        let data;
        try {
          data = loadJsOrJson(raw, file.name);
        } catch (e) {
          throw new Error("파일 파싱 실패: " + (e as Error).message);
        }

        if (!Array.isArray(data) || data.length === 0) {
          throw new Error("유효한 트윗 배열을 찾을 수 없습니다.");
        }

        setProgress(0.1);
        setProgressLabel("유저네임 감지 중...");
        await tick();

        const detected = extractUsername(data);
        const username = detected ?? (manualUsername.trim() || "unknown");

        setProgress(0.15);
        setProgressLabel(`필터링 중... (유저: ${username})`);
        await tick();

        const result = await filterTweets(data, username, (ratio) => {
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
    [manualUsername],
  );

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
  };

  const isIdle = phase === "idle" || phase === "error";
  const isProcessing = phase === "filtering" || phase === "zipping";

  return (
    <div className="container">
      <h1>Tweet Thread Filter</h1>

      {isIdle && (
        <DropZone
          onFile={handleFile}
          username={manualUsername}
          onUsernameChange={setManualUsername}
        />
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
