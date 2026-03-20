import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { filterTweets, loadJsOrJson } from "../../utils/filter";
import { buildZip } from "../../utils/archive";
import type { FilterOptions, FilterResult } from "../../types";
import { ProgressBar } from "../ProgressBar";
import { theme } from "../../styles/theme";

interface Props {
  files: File[];
  username: string;
  filterOptions: FilterOptions;
  onDone: (stats: FilterResult, zip: Blob) => void;
  onError: (msg: string) => void;
}

const SENTENCES = ["내가 알고 있는 기억들", "내가 잊어버린 기억들", "별처럼 빛나며 우릴 살게하네"];

const DURATION = 2500;

const fadeInOut = keyframes`
  0%   { opacity: 0; transform: translateY(10px); }
  18%  { opacity: 1; transform: translateY(0); }
  75%  { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-10px); }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
`;

const SentenceArea = styled.div`
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const fadeIn = keyframes`
  0%   { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const Sentence = styled.span`
  font-size: ${theme.fontSizes.xl};
  color: ${theme.colors.text};
  text-align: center;
  animation: ${fadeInOut} ${DURATION}ms ease-in-out forwards;
`;

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.2; }
`;

const FallbackSentence = styled.span`
  font-size: ${theme.fontSizes.xl};
  color: ${theme.colors.text};
  text-align: center;
  animation:
    ${fadeIn} 600ms ease-out forwards,
    ${blink} 2.8s ease-in-out 600ms infinite;
`;

const FallbackDescription = styled.span`
  font-size: ${theme.fontSizes.md};
  color: ${theme.colors.textMuted};
  text-align: center;
  margin-top: 8px;
  animation: ${fadeIn} 600ms ease-out forwards;
`;

export function Processing({ files, username, filterOptions, onDone, onError }: Props) {
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState("파일 읽는 중...");
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [cycleDone, setCycleDone] = useState(false);

  useEffect(() => {
    let count = 0;
    const interval = setInterval(() => {
      count++;
      if (count >= SENTENCES.length) {
        clearInterval(interval);
        setCycleDone(true);
        return;
      }
      setSentenceIndex(count % SENTENCES.length);
      setAnimKey((k) => k + 1);
    }, DURATION);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLabel(`파일 읽는 중... (0 / ${files.length})`);
        await tick();

        let readCount = 0;
        const chunks = await Promise.all(
          files.map(async (file) => {
            const raw = await file.text();
            try {
              const parsed = loadJsOrJson(raw, file.name);
              if (!cancelled) {
                readCount++;
                setLabel(`파일 읽는 중... (${readCount} / ${files.length})`);
              }
              return parsed;
            } catch (e) {
              throw new Error(`${file.name} 파싱 실패: ` + (e as Error).message);
            }
          }),
        );
        if (cancelled) return;
        const allData = chunks.flat();

        setProgress(0.1);
        setLabel("파싱 중...");
        await tick();

        if (!Array.isArray(allData) || allData.length === 0) {
          throw new Error("유효한 트윗 배열을 찾을 수 없습니다.");
        }

        setProgress(0.15);
        setLabel(`필터링 중... (@${username})`);
        await tick();

        const result = await filterTweets(allData, username, filterOptions, (ratio) => {
          if (!cancelled) {
            setProgress(0.15 + ratio * 0.5);
            setLabel("필터링 중...");
          }
        });

        // filterTweets 완료 후 원본 데이터 해제
        allData.length = 0;

        if (cancelled) return;
        setProgress(0.65);
        setLabel(`ZIP 생성 중... (0 / ${result.result.length})`);
        await tick();

        const zip = await buildZip(result.result, (ratio) => {
          if (!cancelled) {
            const done = Math.round(ratio * result.result.length);
            setProgress(0.65 + ratio * 0.33);
            setLabel(`ZIP 생성 중... (${done} / ${result.result.length})`);
          }
        });

        if (cancelled) return;
        setProgress(0.98);
        setLabel("압축 완료, 다운로드 준비 중...");
        await tick();

        setProgress(1);
        onDone(result, zip);
      } catch (e) {
        if (!cancelled) onError((e as Error).message);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Wrapper>
      <SentenceArea>
        {cycleDone ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <FallbackSentence>이매지너리 로딩중...</FallbackSentence>
            <FallbackDescription>페이지를 이탈하지 마세요</FallbackDescription>
          </div>
        ) : (
          <Sentence key={animKey}>{SENTENCES[sentenceIndex]}</Sentence>
        )}
      </SentenceArea>
      <ProgressBar label={label} progress={progress} />
    </Wrapper>
  );
}

function tick() {
  return new Promise((r) => setTimeout(r, 0));
}
