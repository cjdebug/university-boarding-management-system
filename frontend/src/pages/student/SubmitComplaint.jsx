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
      const dataToSend = {
        complaint_type: formData.complaint_type,
        description: formData.description,
      };

      const createdComplaint = await apiRequest("/complaints", {
        method: "POST",
        body: JSON.stringify(dataToSend),
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
    <div className="page-container">
      <div className="page-header">
        <h1>Submit Complaint</h1>
        <p>Submit a complaint related to your boarding experience.</p>
      </div>

      {message && <div className="message-success">{message}</div>}

      {error && <div className="message-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-section">
          <h3>Complaint Details</h3>

          <div className="form-grid">
            <div className="form-group full-width">
              <label>Complaint Type</label>

              <select
                name="complaint_type"
                value={formData.complaint_type}
                onChange={handleChange}
                required
              >
                <option value="">Select Complaint Type</option>
                <option value="Noise">Noise</option>
                <option value="Cleanliness">Cleanliness</option>
                <option value="Facilities">Facilities</option>
                <option value="Roommate">Roommate</option>
                <option value="Safety">Safety</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Description</label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your complaint clearly"
                required
              />
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          Submit Complaint
        </button>
      </form>
    </div>
  );
}

export default SubmitComplaint;
