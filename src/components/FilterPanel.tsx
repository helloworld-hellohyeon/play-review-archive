import { useState } from "react";
import type { FilterOptions } from "../types";

interface Props {
  options: FilterOptions;
  onChange: (options: FilterOptions) => void;
}

export function FilterPanel({ options, onChange }: Props) {
  const [keywordEnabled, setKeywordEnabled] = useState(false);
  const set = (patch: Partial<FilterOptions>) => onChange({ ...options, ...patch });

  const handleKeywordCheck = (checked: boolean) => {
    setKeywordEnabled(checked);
    if (!checked) set({ keyword: "" });
  };

  return (
    <div className="filter-panel">
      <p className="filter-title">필터 조건</p>
      <label className="filter-row">
        <input
          type="checkbox"
          checked={options.datePrefix}
          onChange={(e) => set({ datePrefix: e.target.checked })}
        />
        <span>날짜(yyMMdd)로 시작하는 트윗</span>
      </label>
      <label className="filter-row">
        <input
          type="checkbox"
          checked={options.photoWithThread}
          onChange={(e) => set({ photoWithThread: e.target.checked })}
        />
        <span>사진 있고 스레드 2개 이상</span>
      </label>
      <div className="filter-row">
        <label className="filter-row">
          <input
            type="checkbox"
            checked={keywordEnabled}
            onChange={(e) => handleKeywordCheck(e.target.checked)}
          />
          <span>키워드/해시태그 포함</span>
        </label>
        {keywordEnabled && (
          <input
            type="text"
            className="filter-keyword"
            placeholder="키워드 입력"
            value={options.keyword}
            onChange={(e) => set({ keyword: e.target.value })}
          />
        )}
      </div>
    </div>
  );
}
