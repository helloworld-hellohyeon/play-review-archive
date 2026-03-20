import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { ProgressBar } from "./ProgressBar";
import { theme } from "../styles/theme";

interface Props {
  label: string;
  progress: number;
}

const SENTENCES = ["내가 알고 있는 기억들", "내가 잊어버린 기억들", "별처럼 빛나며 우릴 살게하네"];
const DURATION = 2500;

const fadeInOut = keyframes`
  0%   { opacity: 0; transform: translateY(10px); }
  18%  { opacity: 1; transform: translateY(0); }
  75%  { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-10px); }
`;

const fadeIn = keyframes`
  0%   { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.2; }
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

const Sentence = styled.span`
  font-size: ${theme.fontSizes.xl};
  color: ${theme.colors.text};
  text-align: center;
  animation: ${fadeInOut} ${DURATION}ms ease-in-out forwards;
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

export function ProcessingShell({ label, progress }: Props) {
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
