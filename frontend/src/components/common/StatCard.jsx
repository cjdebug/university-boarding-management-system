function StatCard({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="stat-card">
      <div className="stat-card-content">
        <p className="stat-card-title">{title}</p>

        <h3 className="stat-card-value">{value}</h3>

        {subtitle && <span className="stat-card-subtitle">{subtitle}</span>}
      </div>

      {Icon && (
        <div className="stat-card-icon">
          <Icon size={22} />
        </div>
      )}
    </div>
  );
}

export default StatCard;
