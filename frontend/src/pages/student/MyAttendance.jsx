import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";

function MyAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyAttendance = async () => {
      try {
        const data = await apiRequest("/attendance/my");
        setAttendanceRecords(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyAttendance();
  }, []);

  if (loading) {
    return <p>Loading attendance records...</p>;
  }

  return (
    <div>
      <h1>My Attendance</h1>

      {error && <p>{error}</p>}

      {!error && attendanceRecords.length === 0 && (
        <p>No attendance records found.</p>
      )}

      {attendanceRecords.length > 0 && (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Note</th>
            </tr>
          </thead>

          <tbody>
            {attendanceRecords.map((record) => (
              <tr key={record.attendance_id}>
                <td>{record.attendance_date}</td>
                <td>{record.attendance_status}</td>
                <td>{record.note || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MyAttendance;
