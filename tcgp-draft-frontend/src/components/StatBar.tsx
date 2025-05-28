type StatBarProps = {
  label: string;
  count: number;
  total: number;
};

const StatBar: React.FC<StatBarProps> = ({ label, count, total }) => {
  const widthPercent = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="stat-bar">
      <div className="bar-label">{label} ({count})</div>
      <div className="bar-container">
        <div className="bar-fill" style={{ width: `${widthPercent}%` }} />
      </div>
    </div>
  );
};

export default StatBar;
