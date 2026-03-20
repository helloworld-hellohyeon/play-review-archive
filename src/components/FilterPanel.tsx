import { useState } from "react";
import styled from "@emotion/styled";
import { theme } from "../styles/theme";
import type { FilterOptions } from "../types";

interface Props {
  options: FilterOptions;
  onChange: (options: FilterOptions) => void;
}

const Panel = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
`;

const Title = styled.p`
  font-size: ${theme.fontSizes.xs};
  font-weight: 600;
  color: ${theme.colors.textSubtle};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.1rem;
`;

const Row = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${theme.colors.text};
  cursor: pointer;
  flex-wrap: wrap;
`;

const Checkbox = styled.input`
  width: 1rem;
  height: 1rem;
  accent-color: ${theme.colors.accent};
  cursor: pointer;
  flex-shrink: 0;
`;

const KeywordInput = styled.input`
  flex: 1;
  min-width: 120px;
  background: ${theme.colors.bg};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.sm};
  padding: 0.3rem 0.6rem;
  color: ${theme.colors.text};
  font-size: ${theme.fontSizes.body};
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${theme.colors.accent};
  }

  &::placeholder {
    color: ${theme.colors.borderHover};
  }
`;

export function FilterPanel({ options, onChange }: Props) {
  const [keywordEnabled, setKeywordEnabled] = useState(false);
  const set = (patch: Partial<FilterOptions>) => onChange({ ...options, ...patch });

  const handleKeywordCheck = (checked: boolean) => {
    setKeywordEnabled(checked);
    if (!checked) set({ keyword: "" });
  };

  return (
    <Panel>
      <Title>필터 조건</Title>
      <Row>
        <Checkbox
          type="checkbox"
          checked={options.datePrefix}
          onChange={(e) => set({ datePrefix: e.target.checked })}
        />
        <span>날짜(yyMMdd)로 시작하는 트윗</span>
      </Row>
      <Row>
        <Checkbox
          type="checkbox"
          checked={options.photoWithThread}
          onChange={(e) => set({ photoWithThread: e.target.checked })}
        />
        <span>사진 있고 스레드 2개 이상</span>
      </Row>
      <div>
        <Row>
          <Checkbox
            type="checkbox"
            checked={keywordEnabled}
            onChange={(e) => handleKeywordCheck(e.target.checked)}
          />
          <span>키워드/해시태그 포함</span>
        </Row>
        {keywordEnabled && (
          <KeywordInput
            type="text"
            placeholder="키워드 입력"
            value={options.keyword}
            onChange={(e) => set({ keyword: e.target.value })}
          />
        )}
      </div>
    </Panel>
  );
}
