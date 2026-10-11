import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";

function MyAttendance() {
  const [records, setRecords] = useState([]);
  const [percentage, setPercentage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyAttendance = async () => {
      try {
        const [attendanceData, percentageData] = await Promise.all([
          apiRequest("/attendance/my"),
          apiRequest("/attendance/my/percentage"),
        ]);

        setRecords(attendanceData);
        setPercentage(percentageData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyAttendance();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-text">Loading attendance records...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Attendance</h1>
        <p>View your attendance history and recorded attendance status.</p>
      </div>

      {error && <div className="message-error">{error}</div>}

      {!error && percentage && (
        <div className="form-card" style={{ marginBottom: "20px" }}>
          <div className="form-section">
            <h3>Attendance Summary</h3>

            <div className="report-summary-grid">
              <div className="report-summary-card">
                <span>Attendance Percentage</span>
                <strong>{percentage.attendance_percentage}%</strong>
              </div>

              <div className="report-summary-card">
                <span>Total Attendance</span>
                <strong>{percentage.total_attendance}</strong>
              </div>

              <div className="report-summary-card">
                <span>Present</span>
                <strong>{percentage.present}</strong>
              </div>

              <div className="report-summary-card">
                <span>Absent</span>
                <strong>{percentage.absent}</strong>
              </div>

              <div className="report-summary-card">
                <span>Late</span>
                <strong>{percentage.late}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {!error && records.length === 0 && (
        <div className="empty-state">No attendance records found.</div>
      )}

      {records.length > 0 && (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>

            <tbody>
              {records.map((record) => {
                const status =
                  record.status || record.attendance_status || "Unknown";

                return (
                  <tr key={record.attendance_id}>

                    <td>{record.attendance_date || record.date || "-"}</td>

                    <td>
                      <span
                        className={`status-badge status-${status.toLowerCase()}`}
                      >
                        {status}
                      </span>
                    </td>

                    <td>{record.note || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MyAttendance;
