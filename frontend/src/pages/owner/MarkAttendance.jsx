import { useState } from "react";
import { apiRequest } from "../../services/api";

function MarkAttendance() {
  const [formData, setFormData] = useState({
    student_id: "",
    attendance_date: "",
    attendance_status: "",
    note: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    try {
      const data = await apiRequest("/attendance", {
        method: "POST",
        body: JSON.stringify({
          student_id: Number(formData.student_id),
          attendance_date: formData.attendance_date,
          attendance_status: formData.attendance_status,
          note: formData.note || null,
        }),
      });

      setMessage(
        `Attendance record ${data.attendance_id} created successfully`,
      );

      setFormData({
        student_id: "",
        attendance_date: "",
        attendance_status: "",
        note: "",
      });
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <h1>Mark Attendance</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Student ID</label>
          <input
            type="number"
            name="student_id"
            value={formData.student_id}
            onChange={handleChange}
            min="1"
            required
          />
        </div>

        <div>
          <label>Attendance Date</label>
          <input
            type="date"
            name="attendance_date"
            value={formData.attendance_date}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Status</label>
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
            <option value="leave">Leave</option>
          </select>
        </div>

        <div>
          <label>Note</label>
          <textarea name="note" value={formData.note} onChange={handleChange} />
        </div>

        <button type="submit">Mark Attendance</button>
      </form>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}
    </div>
  );
}

export default MarkAttendance;
