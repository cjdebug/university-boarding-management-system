import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";

const today = new Date().toISOString().split("T")[0];

function MarkAttendance() {
  const [students, setStudents] = useState([]);

  const [formData, setFormData] = useState({
    student_id: "",
    attendance_date: today,
    attendance_status: "",
    note: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await apiRequest("/students");
        setStudents(data);
      } catch (err) {
        setError(
          typeof err.message === "string"
            ? err.message
            : "Failed to load students.",
        );
      }
    };

    fetchStudents();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const dataToSend = {
        student_id: Number(formData.student_id),
        attendance_date: formData.attendance_date,
        attendance_status: formData.attendance_status,
        note: formData.note || null,
      };

      const createdAttendance = await apiRequest("/attendance", {
        method: "POST",
        body: JSON.stringify(dataToSend),
      });

      setMessage(
        `Attendance recorded successfully. Attendance ID: ${createdAttendance.attendance_id}`,
      );

      setFormData({
        student_id: "",
        attendance_date: today,
        attendance_status: "",
        note: "",
      });
    } catch (err) {
      let errorMessage = "Failed to record attendance.";

      if (typeof err.message === "string") {
        errorMessage = err.message;
      }

      setError(errorMessage);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Mark Attendance</h1>
        <p>Record the daily attendance status of a student resident.</p>
      </div>

      {message && <div className="message-success">{message}</div>}

      {error && <div className="message-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-section">
          <h3>Attendance Details</h3>

          <div className="form-grid">
            <div className="form-group full-width">
              <label>Student</label>

              <select
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Student</option>

                {students.map((student) => (
                  <option key={student.student_id} value={student.student_id}>
                    {student.registration_no} - {student.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Attendance Date</label>

              <input
                type="date"
                name="attendance_date"
                value={formData.attendance_date}
                onChange={handleChange}
                max={today}
                required
              />
            </div>

            <div className="form-group">
              <label>Status</label>

              <select
                name="attendance_status"
                value={formData.attendance_status}
                onChange={handleChange}
                required
              >
                <option value="">Select Status</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Remarks</label>

              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="Optional attendance note"
              />
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          Mark Attendance
        </button>
      </form>
    </div>
  );
}

export default MarkAttendance;
