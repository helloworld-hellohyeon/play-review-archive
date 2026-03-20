import { Global, css } from "@emotion/react";
import { theme } from "./theme";

export function GlobalStyle() {
  return (
    <Global
      styles={css`
        @import url("https://cdn.jsdelivr.net/gh/fonts-archive/Paperlogy/subsets/Paperlogy-dynamic-subset.css");

        ::-webkit-scrollbar {
          display: none;
        }

        *,
        *::before,
        *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family:
            "Paperlogy",
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Roboto,
            Oxygen,
            Ubuntu,
            Cantarell,
            "Open Sans",
            "Helvetica Neue",
            sans-serif;
        }

        body {
          background: ${theme.colors.bg};
          color: ${theme.colors.text};
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          scrollbar-gutter: stable;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        #root {
          width: 100%;
          display: flex;
          justify-content: center;
        }
      `}
    />
  );
}
