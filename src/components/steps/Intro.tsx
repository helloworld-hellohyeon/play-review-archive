import { useCallback, useState } from "react";
import { extractUsername, loadJsOrJson } from "../../utils/filter";
import type { FilterOptions } from "../../types";
import { DropZone } from "../DropZone";
import { FilterPanel } from "../FilterPanel";
import { HowToUse } from "../HowToUse";
import { Header, PrimaryButton, Subtitle, Title, ErrorBox } from "../Layout";

interface Props {
  onStart: (files: File[], username: string, filterOptions: FilterOptions) => void;
  errorMsg?: string;
}

export function Intro({ onStart, errorMsg }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [username, setUsername] = useState("");
  const [usernameReadOnly, setUsernameReadOnly] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    datePrefix: true,
    photoWithThread: true,
    keyword: "",
  });

  const hasFilterCondition =
    filterOptions.datePrefix || filterOptions.photoWithThread || filterOptions.keyword !== "";
  const canStart = files.length > 0 && username.trim() !== "" && hasFilterCondition;

  const handleFiles = useCallback(async (newFiles: File[]) => {
    setFiles(newFiles);
    setUsername("");
    setUsernameReadOnly(true);
    try {
      const allData = [];
      for (const file of newFiles) {
        const raw = await file.text();
        allData.push(...loadJsOrJson(raw, file.name));
      }
      const detected = extractUsername(allData);
      if (detected) {
        setUsername(detected);
      } else {
        setUsernameReadOnly(false);
      }
    } catch {
      setUsernameReadOnly(false);
    }
  }, []);

  return (
    <>
      <Header>
        <Subtitle>필터링된 스레드를 폴더와 텍스트로 아카이브해요</Subtitle>
        <Title>이매지너리 🧩</Title>
      </Header>

      <DropZone
        onFiles={handleFiles}
        files={files}
        username={username}
        usernameReadOnly={usernameReadOnly}
        onUsernameChange={setUsername}
      />
      <FilterPanel options={filterOptions} onChange={setFilterOptions} />
      <PrimaryButton
        disabled={!canStart}
        onClick={() => onStart(files, username.trim(), filterOptions)}
      >
        아카이브 시작
      </PrimaryButton>
      <HowToUse />
      {errorMsg && <ErrorBox>{errorMsg}</ErrorBox>}
    </>
  );
}
