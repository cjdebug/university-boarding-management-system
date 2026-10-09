import { useEffect, useState } from "react";
import { apiRequest } from "../../../services/api";

function ComplaintStatistics() {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        const data = await apiRequest("/complaints/statistics");
        setStatistics(data);
      } catch (err) {
        setError(err.message || "Failed to load complaint statistics.");
      } finally {
        setLoading(false);
      }
    };

    loadStatistics();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-text">Loading complaint statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Complaint Category Statistics</h1>
          <div className="message-error">{error}</div>
        </div>
      </div>
    );
  }

  const categories = Object.entries(statistics.categories);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Complaint Category Statistics</h1>
        <p>View the number of complaints submitted under each category.</p>
      </div>

      <div className="report-summary-grid">
        <div className="report-summary-card">
          <span>Total Complaints</span>
          <strong>{statistics.total_complaints}</strong>
        </div>
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Complaint Category</th>
              <th>Number of Complaints</th>
            </tr>
          </thead>

          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="2">No complaint categories found.</td>
              </tr>
            ) : (
              categories.map(([category, count]) => (
                <tr key={category}>
                  <td>{category}</td>
                  <td>{count}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ComplaintStatistics;
