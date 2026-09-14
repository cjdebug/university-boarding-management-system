import { useState } from "react";
import { apiRequest } from "../../services/api";

function AddRoom() {
  const [formData, setFormData] = useState({
    room_number: "",
    floor_number: "",
    capacity: "",
    description: "",
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
        floor_number: formData.floor_number
          ? Number(formData.floor_number)
          : null,
        capacity: Number(formData.capacity),
        description: formData.description || null,
      };

      const createdRoom = await apiRequest("/rooms", {
        method: "POST",
        body: JSON.stringify(dataToSend),
      });

      setMessage(`Room created successfully. Room ID: ${createdRoom.room_id}`);

      setFormData({
        room_number: "",
        floor_number: "",
        capacity: "",
        description: "",
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
              <label>Floor Number</label>

              <input
                type="number"
                name="floor_number"
                value={formData.floor_number}
                onChange={handleChange}
                min="0"
                placeholder="Example: 1"
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

            <div className="form-group full-width">
              <label>Description</label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Example: First floor room near the study area"
              />
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
