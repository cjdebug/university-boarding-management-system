import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";

const today = new Date().toISOString().split("T")[0];

function BulkAttendance() {
  const [students, setStudents] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(today);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await apiRequest("/students");

        setStudents(data);

        setRecords(
          data.map((student) => ({
            student_id: student.student_id,
            attendance_status: "Present",
            note: "",
          })),
        );
      } catch (err) {
        setError(
          typeof err.message === "string"
            ? err.message
            : "Failed to load students.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleStatusChange = (studentId, status) => {
    setRecords((currentRecords) =>
      currentRecords.map((record) =>
        record.student_id === studentId
          ? { ...record, attendance_status: status }
          : record,
      ),
    );
  };

  const handleNoteChange = (studentId, note) => {
    setRecords((currentRecords) =>
      currentRecords.map((record) =>
        record.student_id === studentId ? { ...record, note: note } : record,
      ),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const dataToSend = {
        attendance_date: attendanceDate,
        records: records.map((record) => ({
          student_id: record.student_id,
          attendance_date: attendanceDate,
          attendance_status: record.attendance_status,
          note: record.note || null,
        })),
      };

      const createdRecords = await apiRequest("/attendance/bulk", {
        method: "POST",
        body: JSON.stringify(dataToSend),
      });

      setMessage(
        `Bulk attendance recorded successfully for ${createdRecords.length} students.`,
      );
    } catch (err) {
      setError(
        typeof err.message === "string"
          ? err.message
          : "Failed to record bulk attendance.",
      );
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-text">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Bulk Attendance</h1>
        <p>Mark attendance for multiple students at once.</p>
      </div>

      {message && <div className="message-success">{message}</div>}

      {error && <div className="message-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-section">
          <h3>Attendance Details</h3>

          <div className="form-group">
            <label>Attendance Date</label>

            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              max={today}
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Student Attendance</h3>

          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>

              <tbody>
                {students.map((student) => {
                  const record = records.find(
                    (item) => item.student_id === student.student_id,
                  );

                  return (
                    <tr key={student.student_id}>
                      <td>
                        {student.registration_no} - {student.full_name}
                      </td>

                      <td>
                        <select
                          value={record?.attendance_status || "Present"}
                          onChange={(e) =>
                            handleStatusChange(
                              student.student_id,
                              e.target.value,
                            )
                          }
                        >
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                          <option value="Late">Late</option>
                        </select>
                      </td>

                      <td>
                        <input
                          type="text"
                          value={record?.note || ""}
                          onChange={(e) =>
                            handleNoteChange(student.student_id, e.target.value)
                          }
                          placeholder="Optional"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          Mark All Attendance
        </button>
      </form>
    </div>
  );
}

export default BulkAttendance;
