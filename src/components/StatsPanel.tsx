interface Props {
  totalCount: number;
  rootCount: number;
  threadCount: number;
}

export function StatsPanel({ totalCount, rootCount, threadCount }: Props) {
  return (
    <div className="stats-panel">
      <div className="stat">
        <div className="stat-value">{totalCount.toLocaleString()}</div>
        <div className="stat-label">총 트윗</div>
      </div>
      <div className="stat-divider" />
      <div className="stat">
        <div className="stat-value">{rootCount.toLocaleString()}</div>
        <div className="stat-label">루트</div>
      </div>
      <div className="stat-divider" />
      <div className="stat">
        <div className="stat-value">{threadCount.toLocaleString()}</div>
        <div className="stat-label">스레드</div>
      </div>
    </div>
  );
}
