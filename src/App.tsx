import { useState } from "react";
import type { FilterOptions, FilterResult } from "./types";
import { GlobalStyle } from "./styles/GlobalStyle";
import { Container } from "./components/Layout";
import { Intro } from "./components/steps/Intro";
import { Processing } from "./components/steps/Processing";
import { Result } from "./components/steps/Result";

type Phase = "idle" | "processing" | "done" | "error";

interface IntroData {
  files: File[];
  username: string;
  filterOptions: FilterOptions;
}

interface ResultData {
  stats: FilterResult;
  zip: Blob;
}

export default function App() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [introData, setIntroData] = useState<IntroData | null>(null);
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleStart = (files: File[], username: string, filterOptions: FilterOptions) => {
    setIntroData({ files, username, filterOptions });
    setResultData(null);
    setErrorMsg("");
    setPhase("processing");
  };

  const handleDone = (stats: FilterResult, zip: Blob) => {
    setResultData({ stats, zip });
    setPhase("done");
  };

  const handleError = (msg: string) => {
    setErrorMsg(msg);
    setPhase("error");
  };

  const handleReset = () => {
    setIntroData(null);
    setResultData(null);
    setErrorMsg("");
    setPhase("idle");
  };

  return (
    <>
      <GlobalStyle />
      <Container>
        {(phase === "idle" || phase === "error") && (
          <Intro onStart={handleStart} errorMsg={errorMsg} />
        )}

        {phase === "processing" && introData && (
          <Processing
            files={introData.files}
            username={introData.username}
            filterOptions={introData.filterOptions}
            onDone={handleDone}
            onError={handleError}
          />
        )}

        {phase === "done" && resultData && introData && (
          <Result
            stats={resultData.stats}
            username={introData.username}
            zip={resultData.zip}
            onReset={handleReset}
          />
        )}
      </Container>
    </>
  );
}
