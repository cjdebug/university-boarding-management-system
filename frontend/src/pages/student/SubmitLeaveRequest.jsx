import { useState } from "react";
import { apiRequest } from "../../services/api";

const today = new Date().toISOString().split("T")[0];

function SubmitLeaveRequest() {
  const [formData, setFormData] = useState({
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
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
        leave_type: formData.leave_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason,
      };

      const createdRequest = await apiRequest("/leave-requests", {
        method: "POST",
        body: JSON.stringify(dataToSend),
      });

      setMessage(
        `Leave request submitted successfully. Request ID: ${createdRequest.leave_request_id}`,
      );

      setFormData({
        leave_type: "",
        start_date: "",
        end_date: "",
        reason: "",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Submit Leave Request</h1>
        <p>Submit a leave request for an upcoming absence from the boarding.</p>
      </div>

      {message && <div className="message-success">{message}</div>}

      {error && <div className="message-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-section">
          <h3>Leave Details</h3>

          <div className="form-grid">
            <div className="form-group">
              <label>Leave Type</label>

              <select
                name="leave_type"
                value={formData.leave_type}
                onChange={handleChange}
                required
              >
                <option value="">Select Leave Type</option>
                <option value="Home Visit">Home Visit</option>
                <option value="Overnight Leave">Overnight Leave</option>
                <option value="Personal">Personal</option>
                <option value="Medical">Medical</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Start Date</label>

              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                min={today}
                required
              />
            </div>

            <div className="form-group">
              <label>End Date</label>

              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                min={formData.start_date || today}
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Reason</label>

              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Enter the reason for your leave request"
                required
              />
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          Submit Leave Request
        </button>
      </form>
    </div>
  );
}

export default SubmitLeaveRequest;
