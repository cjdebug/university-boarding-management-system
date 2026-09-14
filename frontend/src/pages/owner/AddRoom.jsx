import { useState } from "react";
import { apiRequest } from "../../services/api";

function AddRoom() {
  const [formData, setFormData] = useState({
    room_number: "",
    room_type: "",
    capacity: "",
    monthly_fee: "",
    room_status: "available",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
        room_number: formData.room_number,
        room_type: formData.room_type || null,
        capacity: Number(formData.capacity),
        monthly_fee: formData.monthly_fee ? Number(formData.monthly_fee) : null,
        room_status: formData.room_status,
      };

      const createdRoom = await apiRequest("/rooms", {
        method: "POST",
        body: JSON.stringify(dataToSend),
      });

      setMessage(`Room created successfully. Room ID: ${createdRoom.room_id}`);

      setFormData({
        room_number: "",
        room_type: "",
        capacity: "",
        monthly_fee: "",
        room_status: "available",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Add Room</h1>
        <p>Add a new boarding room and its basic details.</p>
      </div>

      {message && <div className="message-success">{message}</div>}

      {error && <div className="message-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-section">
          <h3>Room Details</h3>

          <div className="form-grid">
            <div className="form-group">
              <label>Room Number</label>

              <input
                type="text"
                name="room_number"
                value={formData.room_number}
                onChange={handleChange}
                placeholder="Example: R101"
                required
              />
            </div>

            <div className="form-group">
              <label>Room Type</label>

              <input
                type="text"
                name="room_type"
                value={formData.room_type}
                onChange={handleChange}
                placeholder="Example: Double"
              />
            </div>

            <div className="form-group">
              <label>Capacity</label>

              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                placeholder="Enter number of beds"
                required
              />
            </div>

            <div className="form-group">
              <label>Monthly Fee</label>

              <input
                type="number"
                name="monthly_fee"
                value={formData.monthly_fee}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="Optional"
              />
            </div>

            <div className="form-group">
              <label>Room Status</label>

              <select
                name="room_status"
                value={formData.room_status}
                onChange={handleChange}
              >
                <option value="available">Available</option>
                <option value="full">Full</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          Add Room
        </button>
      </form>
    </div>
  );
}

export default AddRoom;
