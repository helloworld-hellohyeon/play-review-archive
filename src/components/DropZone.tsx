import { useRef, useState } from "react";
import type React from "react";
import styled from "@emotion/styled";
import { theme } from "../styles/theme";

interface Props {
  onFiles: (files: File[]) => void;
  files: File[];
  username: string;
  usernameReadOnly: boolean;
  onUsernameChange: (value: string) => void;
}

const Zone = styled.div<{ $isDragOver: boolean; $hasFiles: boolean }>`
  border: 2px dashed
    ${({ $isDragOver }) => ($isDragOver ? theme.colors.accent : theme.colors.border)};
  border-radius: ${theme.radii.lg};
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;
  user-select: none;
  background: ${({ $isDragOver }) => ($isDragOver ? theme.colors.surface : "transparent")};

  &:hover {
    border-color: ${theme.colors.accent};
    background: ${theme.colors.surface};
  }
`;

const Icon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
`;

const DropText = styled.div`
  color: ${theme.colors.textMuted};
  font-size: ${theme.fontSizes.body};
  line-height: 1.6;

  strong {
    color: ${theme.colors.text};
  }

  span {
    font-size: ${theme.fontSizes.base};
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const FieldLabel = styled.label`
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.textMuted};
  font-weight: 500;
`;

const InputWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Prefix = styled.span`
  position: absolute;
  left: 0.9rem;
  color: ${theme.colors.textSubtle};
  font-size: ${theme.fontSizes.body};
  pointer-events: none;
  user-select: none;
`;

const TextInput = styled.input`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  padding: 0.6rem 0.9rem 0.6rem 2.4rem;
  color: ${theme.colors.text};
  font-size: ${theme.fontSizes.body};
  width: 100%;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${theme.colors.accent};
  }

  &::placeholder {
    color: ${theme.colors.borderHover};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:read-only {
    cursor: default;
    color: ${theme.colors.textMuted};
  }
`;

export function DropZone({ onFiles, files, username, usernameReadOnly, onUsernameChange }: Props) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasFiles = files.length > 0;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = Array.from(e.dataTransfer.files).filter(
      (f) => f.name.endsWith(".js") || f.name.endsWith(".json"),
    );
    if (dropped.length) onFiles(dropped);
  };

  return (
    <>
      <Zone
        $isDragOver={isDragOver}
        $hasFiles={hasFiles}
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
            <Icon>✅</Icon>
            <DropText>
              {files.map((f) => (
                <div key={f.name}>
                  <strong>{f.name}</strong>
                </div>
              ))}
              <span>다른 파일로 바꾸려면 클릭하세요</span>
            </DropText>
          </>
        ) : (
          <>
            <Icon>📂</Icon>
            <DropText>
              트윗 아카이브 파일의 data 폴더 내 <strong>tweets.js</strong> 파일을
              <br />
              드래그하거나 클릭해서 업로드하세요
              <br />
              <span>파일이 여러 개로 나뉜 경우(tweets-part1.js 등) 함께 선택하세요</span>
            </DropText>
          </>
        )}
      </Zone>

      <Field>
        <FieldLabel htmlFor="username">
          트위터 계정 ID{usernameReadOnly && " (자동 감지됨)"}
        </FieldLabel>
        <InputWrap>
          <Prefix>@</Prefix>
          <TextInput
            id="username"
            type="text"
            placeholder="파일을 업로드하면 자동으로 감지됩니다"
            value={username}
            disabled={!hasFiles}
            readOnly={usernameReadOnly}
            onChange={(e) => onUsernameChange(e.target.value)}
          />
        </InputWrap>
      </Field>
    </>
  );
}
