function StatusBadge({ label, type = "success" }) {
  return <span className={`status-badge status-${type}`}>{label}</span>;
}

export default StatusBadge;
