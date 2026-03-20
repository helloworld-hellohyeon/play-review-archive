import { useRef, useState } from "react";
import type React from "react";

interface Props {
  onFiles: (files: File[]) => void;
  files: File[];
  username: string;
  onUsernameChange: (value: string) => void;
}

export function DropZone({ onFiles, files, username, onUsernameChange }: Props) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = Array.from(e.dataTransfer.files).filter(
      (f) => f.name.endsWith(".js") || f.name.endsWith(".json"),
    );
    if (dropped.length) onFiles(dropped);
  };

  const hasFiles = files.length > 0;

  return (
    <>
      <div
        className={`drop-zone${isDragOver ? " dragover" : ""}${hasFiles ? " has-file" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".js,.json"
          multiple
          style={{ display: "none" }}
          onChange={(e) => {
            const selected = Array.from(e.target.files ?? []);
            if (selected.length) onFiles(selected);
          }}
        />
        {hasFiles ? (
          <>
            <div className="drop-icon">✅</div>
            <div className="drop-text">
              {files.map((f) => (
                <div key={f.name}>
                  <strong>{f.name}</strong>
                </div>
              ))}
              <span>다른 파일로 바꾸려면 클릭하세요</span>
            </div>
          </>
        ) : (
          <>
            <div className="drop-icon">📂</div>
            <div className="drop-text">
              트윗 아카이브 파일의 data 폴더 내 <strong>tweets.js</strong> 파일을
              <br />
              드래그하거나 클릭해서 업로드하세요
              <br />
              <span>파일이 여러 개로 나뉜 경우(tweets-part1.js 등) 함께 선택하세요</span>
            </div>
          </>
        )}
      </div>

      <div className="field">
        <label htmlFor="username">아카이브 파일 계정 ID</label>
        <div className="input-prefix-wrap">
          <span className="input-prefix">@</span>
          <input
            id="username"
            type="text"
            placeholder="kai_baker"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
          />
        </div>
      </div>
    </>
  );
}
