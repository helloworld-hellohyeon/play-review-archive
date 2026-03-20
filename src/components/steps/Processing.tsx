import { useEffect, useState } from "react";
import { filterTweets, loadJsOrJson } from "../../utils/filter";
import type { FilterOptions, FilterResult } from "../../types";
import { ProcessingShell } from "../ProcessingShell";

interface Props {
  files: File[];
  username: string;
  filterOptions: FilterOptions;
  onDone: (stats: FilterResult) => void;
  onError: (msg: string) => void;
}

export function Processing({ files, username, filterOptions, onDone, onError }: Props) {
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState("파일 읽는 중...");

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
        setProgress(1);
        setLabel("필터링 완료!");
        await tick();

        onDone(result);
      } catch (e) {
        if (!cancelled) onError((e as Error).message);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return <ProcessingShell label={label} progress={progress} />;
}

function tick() {
  return new Promise((r) => setTimeout(r, 0));
}
