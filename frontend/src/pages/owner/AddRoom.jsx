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
      const data = await apiRequest("/rooms", {
        method: "POST",
        body: JSON.stringify({
          room_number: formData.room_number,
          floor_number: formData.floor_number
            ? Number(formData.floor_number)
            : null,
          capacity: Number(formData.capacity),
          description: formData.description || null,
        }),
      });

      setMessage(`Room ${data.room_number} created successfully`);

      setFormData({
        room_number: "",
        floor_number: "",
        capacity: "",
        description: "",
      });
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <h1>Add Room</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Room Number</label>
          <input
            type="text"
            name="room_number"
            value={formData.room_number}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Floor Number</label>
          <input
            type="number"
            name="floor_number"
            value={formData.floor_number}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Capacity</label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            min="1"
            required
          />
        </div>

        <div>
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <button type="submit">Add Room</button>
      </form>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}
    </div>
  );
}

export default AddRoom;
