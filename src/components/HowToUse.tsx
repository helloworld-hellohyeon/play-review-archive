import { useState } from "react";

export function HowToUse() {
  const [open, setOpen] = useState(false);

  return (
    <div className="how-to-use">
      <button className="how-to-use-toggle" onClick={() => setOpen((v) => !v)}>
        <span>사용 방법</span>
        <span className={`how-to-use-arrow ${open ? "open" : ""}`}>▾</span>
      </button>
      {open && (
        <ol className="how-to-use-body">
          <li>
            트위터/X에서 본인 계정의 데이터를 내려받습니다.
            <br />
            <span className="how-to-use-sub">
              설정 → 계정 → 데이터 아카이브 요청 → 이메일로 받은 zip 파일 압축 해제
            </span>
          </li>
          <li>
            압축 해제된 폴더 안의 <code>data/tweets.js</code> 파일을 준비합니다.
          </li>
          <li>위 드롭존에 파일을 끌어다 놓거나 클릭해서 업로드합니다.</li>
          <li>필터 조건을 선택하고 처리가 완료되면 ZIP 파일을 다운로드합니다.</li>
        </ol>
      )}
    </div>
  );
}
