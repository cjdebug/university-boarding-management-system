import { useEffect, useState } from "react";
import { apiRequest } from "../../../services/api";

function AttendanceReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReport = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/attendance-reports");

      setReport(data);
    } catch (err) {
      setError(err.message || "Failed to load attendance report.");
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

      {/* Attendance Management Report */}
      <div className="report-section report-print-area">
        {/* PDF Header */}
        <div className="print-report-header">
          <h1>Attendance Management Report</h1>
          <p>Boarding Management System</p>
          <span>Generated on: {new Date().toLocaleDateString("en-GB")}</span>
        </div>

        <div className="report-section-header">
          <div>
            <h2>Attendance Management Report</h2>
            <p>View attendance records and student leave requests.</p>
          </div>

          <button
            className="generate-report-button"
            onClick={() => window.print()}
          >
            Generate Report
          </button>
        </div>

        {/* Attendance Summary */}
        <div className="report-summary-grid">
          <div className="report-summary-card">
            <span>Total Attendance</span>
            <strong>{report.summary.total_attendance}</strong>
          </div>

          <div className="report-summary-card">
            <span>Present</span>
            <strong>{report.summary.present}</strong>
          </div>

          <div className="report-summary-card">
            <span>Absent</span>
            <strong>{report.summary.absent}</strong>
          </div>

          <div className="report-summary-card">
            <span>Leave</span>
            <strong>{report.summary.leave}</strong>
          </div>
        </div>

        {/* Attendance Records */}
        <div className="report-section-header report-subsection-header">
          <div>
            <h2>Attendance Records</h2>
            <p>Attendance records recorded for student residents.</p>
          </div>
        </div>

        <div className="report-table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th>Attendance ID</th>
                <th>Student ID</th>
                <th>Date</th>
                <th>Status</th>
                <th>Note</th>
              </tr>
            </thead>

            <tbody>
              {report.attendance_records.length === 0 ? (
                <tr>
                  <td colSpan="5" className="report-empty">
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                report.attendance_records.map((record) => (
                  <tr key={record.attendance_id}>
                    <td>{record.attendance_id}</td>

                    <td>{record.student_id}</td>

                    <td>{record.attendance_date}</td>

                    <td>
                      <span
                        className={`report-status ${record.attendance_status.toLowerCase()}`}
                      >
                        {record.attendance_status}
                      </span>
                    </td>

                    <td>{record.note || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Leave Summary */}
        <div className="report-section-header report-subsection-header">
          <div>
            <h2>Leave Request Summary</h2>
            <p>Summary of student leave requests.</p>
          </div>
        </div>

        <div className="report-summary-grid">
          <div className="report-summary-card">
            <span>Total Leave Requests</span>
            <strong>{report.summary.total_leave_requests}</strong>
          </div>

          <div className="report-summary-card">
            <span>Approved</span>
            <strong>{report.summary.approved_leave}</strong>
          </div>

          <div className="report-summary-card">
            <span>Pending</span>
            <strong>{report.summary.pending_leave}</strong>
          </div>

          <div className="report-summary-card">
            <span>Rejected</span>
            <strong>{report.summary.rejected_leave}</strong>
          </div>
        </div>

        {/* Leave Requests */}
        <div className="report-section-header report-subsection-header">
          <div>
            <h2>Leave Requests</h2>
            <p>Leave requests submitted by student residents.</p>
          </div>
        </div>

        <div className="report-table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th>Leave ID</th>
                <th>Student ID</th>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {report.leave_requests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="report-empty">
                    No leave requests found.
                  </td>
                </tr>
              ) : (
                report.leave_requests.map((request) => (
                  <tr key={request.leave_request_id}>
                    <td>{request.leave_request_id}</td>

                    <td>{request.student_id}</td>

                    <td>{request.leave_type}</td>

                    <td>{request.start_date}</td>

                    <td>{request.end_date}</td>

                    <td>{request.reason}</td>

                    <td>
                      <span
                        className={`report-status ${request.request_status.toLowerCase()}`}
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

export default AttendanceReport;
