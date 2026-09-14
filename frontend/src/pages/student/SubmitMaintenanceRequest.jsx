import { useState } from "react";
import { apiRequest } from "../../services/api";

function SubmitMaintenanceRequest() {
  const [formData, setFormData] = useState({
    issue_type: "",
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
        issue_type: formData.issue_type,
        description: formData.description,
      };

      const createdRequest = await apiRequest("/maintenance-requests", {
        method: "POST",
        body: JSON.stringify(dataToSend),
      });

      setMessage(
        `Maintenance request submitted successfully. Request ID: ${createdRequest.maintenance_request_id}`,
      );

      setFormData({
        issue_type: "",
        description: "",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Submit Maintenance Request</h1>
        <p>
          Report a maintenance issue related to your assigned boarding room.
        </p>
      </div>

      {message && <div className="message-success">{message}</div>}

      {error && <div className="message-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-section">
          <h3>Maintenance Details</h3>

          <div className="form-grid">
            <div className="form-group full-width">
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
                <option value="Cleaning">Cleaning</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Description</label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the maintenance issue clearly"
                required
              />
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          Submit Maintenance Request
        </button>
      </form>
    </div>
  );
}

export default SubmitMaintenanceRequest;
