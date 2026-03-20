import { useEffect, useState } from "react";
import type { ExtractedThread, ExtractResponse, LoadProgressMessage } from "./types";
import { buildZip } from "./archive";
import "./popup.css";

type Phase = "checking" | "not-twitter" | "ready" | "extracting" | "building" | "done" | "error";

function isTwitterStatusUrl(url: string): boolean {
  return /https?:\/\/(?:twitter|x)\.com\/[^/]+\/status\/\d+/.test(url);
}

export default function Popup() {
  const [phase, setPhase] = useState<Phase>("checking");
  const [tabId, setTabId] = useState<number | null>(null);
  const [thread, setThread] = useState<ExtractedThread | null>(null);
  const [progress, setProgress] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.id || !tab.url) {
        setPhase("not-twitter");
        return;
      }
      setTabId(tab.id);
      setPhase(isTwitterStatusUrl(tab.url) ? "ready" : "not-twitter");
    });

    // 콘텐츠 스크립트로부터 로딩 진행상황 수신
    const listener = (msg: LoadProgressMessage) => {
      if (msg.type === "LOAD_PROGRESS") {
        setLoadedCount(msg.loaded);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  async function handleExtract() {
    if (tabId === null) return;
    setPhase("extracting");
    setLoadedCount(0);

    chrome.tabs.sendMessage(
      tabId,
      { type: "EXTRACT_THREAD" },
      async (response: ExtractResponse | undefined) => {
        if (chrome.runtime.lastError || !response) {
          setErrorMsg(chrome.runtime.lastError?.message ?? "콘텐츠 스크립트 응답 없음");
          setPhase("error");
          return;
        }
        if (!response.ok) {
          setErrorMsg(response.error);
          setPhase("error");
          return;
        }

        const extracted = response.thread;
        setThread(extracted);
        setPhase("building");
        setProgress(0);

        try {
          const blob = await buildZip(extracted, (r) => setProgress(r));
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          const safeName =
            extracted.rootTweet.text
              .slice(0, 20)
              .replace(/[/\\:*?"<>|]/g, "")
              .trim() || extracted.rootTweet.tweetId;
          a.download = `${safeName}.zip`;
          a.click();
          URL.revokeObjectURL(url);
          setPhase("done");
        } catch (e) {
          setErrorMsg(String(e));
          setPhase("error");
        }
      },
    );
  }

  const totalTweets = thread ? 1 + thread.replies.length : 0;

  return (
    <div className="popup">
      <header className="header">
        <span className="header-title">이매지너리</span>
        <span className="header-version">v0.0.1 beta</span>
      </header>

      <div className="body">
        {phase === "checking" && <p className="status-message">확인 중...</p>}

        {phase === "not-twitter" && (
          <p className="status-message">Twitter/X 스레드 페이지에서 실행해 주세요.</p>
        )}

        {phase === "ready" && (
          <>
            <p className="status-message">스레드를 ZIP으로 추출합니다.</p>
            <button className="btn btn-primary" onClick={handleExtract}>
              스레드 추출
            </button>
          </>
        )}

        {phase === "extracting" && (
          <>
            <p className="status-message">
              스크롤하며 트윗 로드 중...
              {loadedCount > 0 && <> ({loadedCount}개 수집됨)</>}
            </p>
            <p className="status-message" style={{ fontSize: 12, color: "#555e68" }}>
              {`"답글 보기" 버튼 자동 클릭 · 스레드 끝까지 로드 중`}
            </p>
          </>
        )}

        {phase === "building" && (
          <>
            {thread && (
              <div className="preview">
                <p className="preview-text">{thread.rootTweet.text}</p>
                <p className="preview-meta">
                  @{thread.rootTweet.username} · {totalTweets}개 트윗
                </p>
              </div>
            )}
            <p className="status-message">ZIP 생성 중...</p>
            <div className="progress-wrap">
              <div className="progress-bar" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
          </>
        )}

        {phase === "done" && (
          <>
            {thread && (
              <div className="preview">
                <p className="preview-text">{thread.rootTweet.text}</p>
                <p className="preview-meta">
                  @{thread.rootTweet.username} · {totalTweets}개 트윗
                </p>
              </div>
            )}
            <p className="status-message success">다운로드 완료!</p>
          </>
        )}

        {phase === "error" && <p className="status-message error">오류: {errorMsg}</p>}
      </div>
    </div>
  );
}
