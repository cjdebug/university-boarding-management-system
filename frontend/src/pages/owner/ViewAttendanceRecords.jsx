import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";

function ViewAttendanceRecords() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const data = await apiRequest("/attendance");
        setAttendanceRecords(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  if (loading) {
    return <p>Loading attendance records...</p>;
  }

  return (
    <div>
      <h1>Attendance Records</h1>

      {error && <p>{error}</p>}

      {!error && attendanceRecords.length === 0 && (
        <p>No attendance records found.</p>
      )}

      {attendanceRecords.length > 0 && (
        <table border="1" cellPadding="10">
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
            {attendanceRecords.map((record) => (
              <tr key={record.attendance_id}>
                <td>{record.attendance_id}</td>
                <td>{record.student_id}</td>
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

export default ViewAttendanceRecords;
