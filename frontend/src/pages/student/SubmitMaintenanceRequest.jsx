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
      const createdRequest = await apiRequest("/maintenance-requests", {
        method: "POST",
        body: JSON.stringify(formData),
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
    <div>
      <h1>Submit Maintenance Request</h1>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Issue Type</label>
          <br />

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

        <button type="submit">Submit Request</button>
      </form>
    </div>
  );
}

export default SubmitMaintenanceRequest;
