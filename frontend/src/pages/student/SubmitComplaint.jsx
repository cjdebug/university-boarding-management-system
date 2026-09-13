import { useState } from "react";
import { apiRequest } from "../../services/api";

function SubmitComplaint() {
  const [formData, setFormData] = useState({
    complaint_type: "",
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
      const createdComplaint = await apiRequest("/complaints", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      setMessage(
        `Complaint submitted successfully. Complaint ID: ${createdComplaint.complaint_id}`,
      );

      setFormData({
        complaint_type: "",
        description: "",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Submit Complaint</h1>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Complaint Type</label>
          <br />

          <select
            name="complaint_type"
            value={formData.complaint_type}
            onChange={handleChange}
            required
          >
            <option value="">Select Complaint Type</option>
            <option value="Noise">Noise</option>
            <option value="Cleanliness">Cleanliness</option>
            <option value="Shared Facilities">Shared Facilities</option>
            <option value="Behaviour">Behaviour</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label>Description</label>
          <br />

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <button type="submit">Submit Complaint</button>
      </form>
    </div>
  );
}

export default SubmitComplaint;
