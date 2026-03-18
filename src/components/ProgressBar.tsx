interface Props {
  label: string;
  progress: number; // 0 ~ 1
}

export function ProgressBar({ label, progress }: Props) {
  return (
    <div className="progress-section">
      <div className="progress-label">{label}</div>
      <div className="progress-bg">
        <div className="progress-fill" style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
    </div>
  );
}
