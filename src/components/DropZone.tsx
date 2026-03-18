import { useRef, useState } from "react";
import type React from "react";

interface Props {
  onFile: (file: File) => void;
  username: string;
  onUsernameChange: (value: string) => void;
}

export function DropZone({ onFile, username, onUsernameChange }: Props) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  return (
    <>
      <div
        className={`drop-zone${isDragOver ? " dragover" : ""}`}
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
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files?.[0]) onFile(e.target.files[0]);
          }}
        />
        <div className="drop-icon">📂</div>
        <div className="drop-text">
          트윗 아카이브 파일의 data 폴더 내 <strong>tweets.js</strong> 파일을
          <br />
          드래그하거나 클릭해서 업로드하세요
        </div>
      </div>

      <div className="field">
        <label htmlFor="username">Twitter 유저네임 (자동 감지 실패 시)</label>
        <input
          id="username"
          type="text"
          placeholder="예: jack"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
        />
      </div>
    </>
  );
}
