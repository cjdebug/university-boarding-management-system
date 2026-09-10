import { useState } from "react";
import { apiRequest } from "../../services/api";

function CreateMaintenanceRequest() {
  const [formData, setFormData] = useState({
    student_id: "",
    room_id: "",
    issue_type: "",
    description: "",
    request_date: "",
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
      const data = await apiRequest("/maintenance-requests", {
        method: "POST",
        body: JSON.stringify({
          student_id: Number(formData.student_id),
          room_id: Number(formData.room_id),
          issue_type: formData.issue_type,
          description: formData.description,
          request_date: formData.request_date,
        }),
      });

      setMessage(
        `Maintenance request ${data.maintenance_request_id} created successfully`,
      );

      setFormData({
        student_id: "",
        room_id: "",
        issue_type: "",
        description: "",
        request_date: "",
      });
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <h1>Create Maintenance Request</h1>

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
          <label>Issue Type</label>
          <select
            name="issue_type"
            value={formData.issue_type}
            onChange={handleChange}
            required
          >
            <option value="">Select Issue Type</option>
            <option value="Electrical">Electrical</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Furniture">Furniture</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Request Date</label>
          <input
            type="date"
            name="request_date"
            value={formData.request_date}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">Submit Maintenance Request</button>
      </form>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}
    </div>
  );
}

export default CreateMaintenanceRequest;
