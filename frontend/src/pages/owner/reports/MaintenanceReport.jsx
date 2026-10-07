import { useEffect, useState } from "react";
import { apiRequest } from "../../../services/api";

function MaintenanceReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReport = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/maintenance-reports");

      setReport(data);
    } catch (err) {
      setError(err.message || "Failed to load maintenance report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  if (loading) {
    return (
      <div className="page-container report-page">
        <div className="page-header">
          <h1>Reports</h1>
          <p>Loading report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Reports</h1>

          <div className="report-error">{error}</div>

          <button className="report-retry-button" onClick={loadReport}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Main page heading */}
      <div className="page-header">
        <h1>Reports</h1>
        <p>View and generate boarding management reports.</p>
      </div>

      {/* Maintenance Report */}
      <div className="report-section report-print-area">
        {/* PDF-only header */}
        <div className="print-report-header">
          <h1>Maintenance Request Report</h1>
          <p>Boarding Management System</p>
          <span>Generated on: {new Date().toLocaleDateString("en-GB")}</span>
        </div>

        {/* Report header */}
        <div className="report-section-header">
          <div>
            <h2>Maintenance Request Report</h2>
            <p>
              View maintenance requests, issue types, statuses, and request
              details.
            </p>
          </div>

          <button
            className="generate-report-button"
            onClick={() => window.print()}
          >
            Generate Report
          </button>
        </div>

        {/* Summary cards */}
        <div className="report-summary-grid">
          <div className="report-summary-card">
            <span>Total Requests</span>
            <strong>{report.summary.total_requests}</strong>
          </div>

          <div className="report-summary-card">
            <span>Pending</span>
            <strong>{report.summary.pending}</strong>
          </div>

          <div className="report-summary-card">
            <span>In Progress</span>
            <strong>{report.summary.in_progress}</strong>
          </div>

          <div className="report-summary-card">
            <span>Completed</span>
            <strong>{report.summary.completed}</strong>
          </div>
        </div>

        {/* Maintenance request table */}
        <div className="report-table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Student ID</th>
                <th>Room ID</th>
                <th>Issue Type</th>
                <th>Description</th>
                <th>Request Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {report.maintenance_requests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="report-empty">
                    No maintenance requests found.
                  </td>
                </tr>
              ) : (
                report.maintenance_requests.map((request) => (
                  <tr key={request.maintenance_request_id}>
                    <td>{request.maintenance_request_id}</td>

                    <td>{request.student_id}</td>

                    <td>{request.room_id}</td>

                    <td>{request.issue_type}</td>

                    <td>{request.description}</td>

                    <td>{request.request_date}</td>

                    <td>
                      <span
                        className={`report-status ${request.request_status}`}
                      >
                        {request.request_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MaintenanceReport;
