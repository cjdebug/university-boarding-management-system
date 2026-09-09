import { useState } from "react";
import { apiRequest } from "../../services/api";

function AllocateRoom() {
  const [formData, setFormData] = useState({
    student_id: "",
    room_id: "",
    bed_number: "",
    allocation_date: "",
    expected_checkout_date: "",
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
      const data = await apiRequest("/room-allocations", {
        method: "POST",
        body: JSON.stringify({
          student_id: Number(formData.student_id),
          room_id: Number(formData.room_id),
          bed_number: formData.bed_number || null,
          allocation_date: formData.allocation_date,
          expected_checkout_date: formData.expected_checkout_date || null,
        }),
      });

      setMessage(
        `Room allocated successfully. Allocation ID: ${data.allocation_id}`,
      );

      setFormData({
        student_id: "",
        room_id: "",
        bed_number: "",
        allocation_date: "",
        expected_checkout_date: "",
      });
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <h1>Allocate Room to Student</h1>

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
          <label>Room ID</label>
          <input
            type="number"
            name="room_id"
            value={formData.room_id}
            onChange={handleChange}
            min="1"
            required
          />
        </div>

        <div>
          <label>Bed Number</label>
          <input
            type="text"
            name="bed_number"
            value={formData.bed_number}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Allocation Date</label>
          <input
            type="date"
            name="allocation_date"
            value={formData.allocation_date}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Expected Checkout Date</label>
          <input
            type="date"
            name="expected_checkout_date"
            value={formData.expected_checkout_date}
            onChange={handleChange}
          />
        </div>

        <button type="submit">Allocate Room</button>
      </form>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}
    </div>
  );
}

export default AllocateRoom;
