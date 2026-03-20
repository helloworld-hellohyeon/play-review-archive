export const theme = {
  colors: {
    bg: "#0f1117",
    surface: "#1e293b",
    border: "#334155",
    borderHover: "#475569",
    text: "#e2e8f0",
    textMuted: "#94a3b8",
    textSubtle: "#64748b",
    textStrong: "#f8fafc",
    accent: "#3b82f6",
    accentHover: "#2563eb",
    errorText: "#fca5a5",
    errorBg: "#2d1b1b",
    errorBorder: "#7f1d1d",
    code: "#93c5fd",
  },
  radii: {
    sm: "6px",
    md: "8px",
    lg: "12px",
    full: "999px",
  },
  fontSizes: {
    xs: "0.75rem",
    sm: "0.78rem",
    base: "0.8rem",
    body: "0.9rem",
    md: "0.95rem",
    lg: "1rem",
    xl: "1.8rem",
    "2xl": "3rem",
  },
} as const;

export type Theme = typeof theme;
