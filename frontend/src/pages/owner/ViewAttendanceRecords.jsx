import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";

function ViewAttendanceRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const data = await apiRequest("/attendance");
        setRecords(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
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
        <h1>Attendance Records</h1>
        <p>Review student attendance history and recorded status.</p>
      </div>

      {error && <div className="message-error">{error}</div>}

      {!error && records.length === 0 && (
        <div className="empty-state">No attendance records found.</div>
      )}

      {records.length > 0 && (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Attendance ID</th>
                <th>Student ID</th>
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
                    <td>{record.attendance_id}</td>
                    <td>{record.student_id}</td>
                    <td>{record.attendance_date || record.date || "-"}</td>

                    <td>
                      <span
                        className={`status-badge status-${status.toLowerCase()}`}
                      >
                        {status}
                      </span>
                    </td>

                    <td>{record.remarks || "-"}</td>
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

export default ViewAttendanceRecords;
