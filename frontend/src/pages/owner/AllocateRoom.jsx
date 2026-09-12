import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";

const today = new Date().toISOString().split("T")[0];

function AllocateRoom() {
  const [students, setStudents] = useState([]);

  const [formData, setFormData] = useState({
    student_id: "",
    room_id: "",
    bed_number: "",
    allocation_date: today,
    expected_checkout_date: "",
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
        room_id: Number(formData.room_id),
        bed_number: formData.bed_number || null,
        allocation_date: formData.allocation_date,
        expected_checkout_date: formData.expected_checkout_date || null,
      };

      const createdAllocation = await apiRequest("/room-allocations", {
        method: "POST",
        body: JSON.stringify(dataToSend),
      });

      setMessage(
        `Room allocated successfully. Allocation ID: ${createdAllocation.allocation_id}`,
      );

      setFormData({
        student_id: "",
        room_id: "",
        bed_number: "",
        allocation_date: today,
        expected_checkout_date: "",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Allocate Room to Student</h1>

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
          <label>Room ID</label>
          <br />

          <input
            type="number"
            name="room_id"
            value={formData.room_id}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Bed Number</label>
          <br />

          <input
            type="text"
            name="bed_number"
            value={formData.bed_number}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Allocation Date</label>
          <br />

          <input
            type="date"
            name="allocation_date"
            value={formData.allocation_date}
            onChange={handleChange}
            min={today}
            required
          />
        </div>

        <div>
          <label>Expected Checkout Date</label>
          <br />

          <input
            type="date"
            name="expected_checkout_date"
            value={formData.expected_checkout_date}
            onChange={handleChange}
            min={formData.allocation_date || today}
          />
        </div>

        <br />

        <button type="submit">Allocate Room</button>
      </form>
    </div>
  );
}

export default AllocateRoom;
