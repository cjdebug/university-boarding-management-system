import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../../services/api";

const today = new Date().toISOString().split("T")[0];

function UpdateAttendance() {
  const navigate = useNavigate();
  const { attendance_id } = useParams();

  const [students, setStudents] = useState([]);

  const [formData, setFormData] = useState({
    student_id: "",
    attendance_date: "",
    attendance_status: "",
    note: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [studentsData, attendanceRecords] = await Promise.all([
          apiRequest("/students"),
          apiRequest("/attendance"),
        ]);

        setStudents(studentsData);

        const attendance = attendanceRecords.find(
          (record) => record.attendance_id === Number(attendance_id),
        );

        if (!attendance) {
          setError("Attendance record not found.");
          return;
        }

        setFormData({
          student_id: String(attendance.student_id),
          attendance_date: attendance.attendance_date,
          attendance_status: attendance.attendance_status,
          note: attendance.note || "",
        });
      } catch (err) {
        setError(
          typeof err.message === "string"
            ? err.message
            : "Failed to load attendance record.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [attendance_id]);

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

      const updatedAttendance = await apiRequest(
        `/attendance/${attendance_id}`,
        {
          method: "PUT",
          body: JSON.stringify(dataToSend),
        },
      );

      setMessage(
        `Attendance updated successfully. Attendance ID: ${updatedAttendance.attendance_id}`,
      );

      setTimeout(() => {
        navigate("/owner/attendance");
      }, 1000);
    } catch (err) {
      setError(
        typeof err.message === "string"
          ? err.message
          : "Failed to update attendance.",
      );
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-text">Loading attendance record...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Update Attendance</h1>
        <p>Update the attendance record of a student resident.</p>
      </div>

      {message && <div className="message-success">{message}</div>}

      {error && <div className="message-error">{error}</div>}

      {!error && (
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

          <div>
            <button type="submit" className="btn btn-primary">
              Update Attendance
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/owner/attendance")}
              style={{ marginLeft: "10px" }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default UpdateAttendance;
