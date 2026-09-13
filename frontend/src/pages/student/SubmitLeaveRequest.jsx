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

      const leaveRequest = await apiRequest("/leave-requests", {
        method: "POST",
        body: JSON.stringify(dataToSend),
      });

      setMessage(
        `Leave request submitted successfully. Request ID: ${leaveRequest.leave_request_id}`,
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
    <div>
      <h1>Submit Leave Request</h1>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Leave Type</label>
          <br />

          <select
            name="leave_type"
            value={formData.leave_type}
            onChange={handleChange}
            required
          >
            <option value="">Select Leave Type</option>
            <option value="Home Visit">Home Visit</option>
            <option value="Overnight Leave">Overnight Leave</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label>Start Date</label>
          <br />

          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            min={today}
            required
          />
        </div>

        <div>
          <label>End Date</label>
          <br />

          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            min={formData.start_date || today}
            required
          />
        </div>

        <div>
          <label>Reason</label>
          <br />

          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <button type="submit">Submit Leave Request</button>
      </form>
    </div>
  );
}

export default SubmitLeaveRequest;
