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
        setError(err.message);
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
        `Attendance marked successfully. Attendance ID: ${createdAttendance.attendance_id}`,
      );

      setFormData({
        student_id: "",
        attendance_date: today,
        attendance_status: "",
        note: "",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Mark Attendance</h1>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Student</label>
          <br />

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

        <div>
          <label>Attendance Date</label>
          <br />

          <input
            type="date"
            name="attendance_date"
            value={formData.attendance_date}
            onChange={handleChange}
            max={today}
            required
          />
        </div>

        <div>
          <label>Attendance Status</label>
          <br />

          <select
            name="attendance_status"
            value={formData.attendance_status}
            onChange={handleChange}
            required
          >
            <option value="">Select Status</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
          </select>
        </div>

        <div>
          <label>Note</label>
          <br />

          <textarea name="note" value={formData.note} onChange={handleChange} />
        </div>

        <br />

        <button type="submit">Mark Attendance</button>
      </form>
    </div>
  );
}

export default MarkAttendance;
