import { useRef, useState } from "react";
import type React from "react";

interface Props {
  onFile: (file: File) => void;
  file: File | null;
  username: string;
  onUsernameChange: (value: string) => void;
}

export function DropZone({ onFile, file, username, onUsernameChange }: Props) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFile(dropped);
  };

  return (
    <>
      <div
        className={`drop-zone${isDragOver ? " dragover" : ""}${file ? " has-file" : ""}`}
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
        {file ? (
          <>
            <div className="drop-icon">✅</div>
            <div className="drop-text">
              <strong>{file.name}</strong>
              <br />
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
            </div>
          </>
        )}
      </div>

      <div className="field">
        <label htmlFor="username">트위터(X) ID</label>
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
