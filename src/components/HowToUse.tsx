import { useState } from "react";
import styled from "@emotion/styled";
import { theme } from "../styles/theme";
import { Code } from "./Layout";

const Wrapper = styled.div`
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  overflow: hidden;
`;

const Toggle = styled.button`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.25rem;
  background: transparent;
  color: ${theme.colors.textMuted};
  font-size: ${theme.fontSizes.base};
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition:
    color 0.2s,
    background 0.2s;

  &:hover {
    color: ${theme.colors.text};
    background: ${theme.colors.surface};
  }
`;

const Arrow = styled.span<{ $open: boolean }>`
  display: inline-block;
  font-size: ${theme.fontSizes.lg};
  line-height: 1;
  transition: transform 0.2s;
  transform: ${({ $open }) => ($open ? "rotate(180deg)" : "rotate(0deg)")};
`;

const Body = styled.ol`
  padding: 0.75rem 1.25rem 1rem 2.25rem;
  border-top: 1px solid ${theme.colors.surface};
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  font-size: 0.82rem;
  color: ${theme.colors.textMuted};
  line-height: 1.6;
`;

const Sub = styled.span`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSubtle};
`;


export function HowToUse() {
  const [open, setOpen] = useState(false);

  return (
    <Wrapper>
      <Toggle onClick={() => setOpen((v) => !v)}>
        <span>사용 방법</span>
        <Arrow $open={open}>▾</Arrow>
      </Toggle>
      {open && (
        <Body>
          <li>
            트위터/X에서 본인 계정의 데이터를 내려받습니다.
            <br />
            <Sub>설정 → 계정 → 데이터 아카이브 요청 → 이메일로 받은 zip 파일 압축 해제</Sub>
          </li>
          <li>
            압축 해제된 폴더 안의 <Code>data/tweets.js</Code> 파일을 준비합니다.
          </li>
          <li>위 드롭존에 파일을 끌어다 놓거나 클릭해서 업로드합니다.</li>
          <li>필터 조건을 선택하고 처리가 완료되면 ZIP 파일을 다운로드합니다.</li>
        </Body>
      )}
    </Wrapper>
  );
}
