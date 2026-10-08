import { useEffect, useState } from "react";
import { apiRequest } from "../../../services/api";

function CommunicationTurnoverReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReport = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/communication-turnover-reports");

      setReport(data);
    } catch (err) {
      setError(
        err.message || "Failed to load communication and turnover report.",
      );
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
      <div className="page-header">
        <h1>Reports</h1>
        <p>View and generate boarding management reports.</p>
      </div>

      <div className="report-section report-print-area">
        {/* PDF header */}
        <div className="print-report-header">
          <h1>Communication &amp; Turnover Report</h1>
          <p>Boarding Management System</p>
          <span>Generated on: {new Date().toLocaleDateString("en-GB")}</span>
        </div>

        {/* Report heading */}
        <div className="report-section-header">
          <div>
            <h2>Communication &amp; Turnover Report</h2>
            <p>View boarding announcements and student feedback.</p>
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
            <span>Total Announcements</span>
            <strong>{report.summary.total_announcements}</strong>
          </div>

          <div className="report-summary-card">
            <span>Active Announcements</span>
            <strong>{report.summary.active_announcements}</strong>
          </div>

          <div className="report-summary-card">
            <span>Inactive Announcements</span>
            <strong>{report.summary.inactive_announcements}</strong>
          </div>

          <div className="report-summary-card">
            <span>Total Feedback</span>
            <strong>{report.summary.total_feedback}</strong>
          </div>
        </div>

        {/* Announcement summary */}
        <div className="report-subsection">
          <h2>Announcement Summary</h2>

          <div className="report-summary-grid">
            <div className="report-summary-card">
              <span>All Students</span>
              <strong>{report.summary.all_students_announcements}</strong>
            </div>

            <div className="report-summary-card">
              <span>Residents</span>
              <strong>{report.summary.residents_announcements}</strong>
            </div>

            <div className="report-summary-card">
              <span>Active</span>
              <strong>{report.summary.active_announcements}</strong>
            </div>

            <div className="report-summary-card">
              <span>Inactive</span>
              <strong>{report.summary.inactive_announcements}</strong>
            </div>
          </div>
        </div>

        {/* Announcements */}
        <div className="report-subsection">
          <h2>Announcements</h2>

          <p>Announcements shared with student residents.</p>

          <div className="report-table-wrapper">
            <table className="report-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Audience</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {report.announcements.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="report-empty">
                      No announcements found.
                    </td>
                  </tr>
                ) : (
                  report.announcements.map((announcement) => (
                    <tr key={announcement.announcement_id}>
                      <td>{announcement.announcement_id}</td>

                      <td>{announcement.title}</td>

                      <td>{announcement.message}</td>

                      <td>{announcement.announcement_date}</td>

                      <td>{announcement.audience}</td>

                      <td>
                        <span
                          className={`report-status ${
                            announcement.announcement_status
                          }`}
                        >
                          {announcement.announcement_status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feedback */}
        <div className="report-subsection">
          <h2>Student Feedback</h2>

          <p>Feedback submitted by student residents.</p>

          <div className="report-table-wrapper">
            <table className="report-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student ID</th>
                  <th>Feedback Type</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {report.feedback.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="report-empty">
                      No feedback found.
                    </td>
                  </tr>
                ) : (
                  report.feedback.map((feedback) => (
                    <tr key={feedback.feedback_id}>
                      <td>{feedback.feedback_id}</td>

                      <td>{feedback.student_id}</td>

                      <td>{feedback.feedback_type}</td>

                      <td>{feedback.message}</td>

                      <td>{feedback.feedback_date}</td>

                      <td>
                        <span
                          className={`report-status ${
                            feedback.feedback_status
                          }`}
                        >
                          {feedback.feedback_status}
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
    </div>
  );
}

export default CommunicationTurnoverReport;
