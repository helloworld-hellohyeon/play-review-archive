import { useState } from "react";
import type { FilterOptions, FilterResult } from "./types";
import { GlobalStyle } from "./styles/GlobalStyle";
import { Container } from "./components/Layout";
import { Footer } from "./components/Footer";
import { Intro } from "./components/steps/Intro";
import { Processing } from "./components/steps/Processing";
import { Review } from "./components/steps/Review";

type Phase = "idle" | "processing" | "review" | "error";

interface IntroData {
  files: File[];
  username: string;
  filterOptions: FilterOptions;
}

export default function App() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [introData, setIntroData] = useState<IntroData | null>(null);
  const [filterResult, setFilterResult] = useState<FilterResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [lastFilterOptions, setLastFilterOptions] = useState<FilterOptions | null>(null);

  const handleStart = (files: File[], username: string, filterOptions: FilterOptions) => {
    setIntroData({ files, username, filterOptions });
    setLastFilterOptions(filterOptions);
    setFilterResult(null);
    setErrorMsg("");
    setPhase("processing");
  };

  const handleDone = (stats: FilterResult) => {
    setFilterResult(stats);
    setPhase("review");
  };

  const handleError = (msg: string) => {
    setErrorMsg(msg);
    setPhase("error");
  };

  const handleReset = () => {
    setIntroData(null);
    setFilterResult(null);
    setErrorMsg("");
    setPhase("idle");
  };

  return (
    <>
      <GlobalStyle />
      <Footer />
      <Container>
        {(phase === "idle" || phase === "error") && (
          <Intro onStart={handleStart} errorMsg={errorMsg} initialFilterOptions={lastFilterOptions ?? undefined} />
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

        {phase === "review" && filterResult && introData && (
          <Review
            stats={filterResult}
            username={introData.username}
            onReset={handleReset}
          />
        )}
      </Container>
    </>
  );
}
