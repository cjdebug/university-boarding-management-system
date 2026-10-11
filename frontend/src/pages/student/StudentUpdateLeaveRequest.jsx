import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../../services/api";

const today = new Date().toISOString().split("T")[0];

function UpdateLeaveRequest() {
  const navigate = useNavigate();
  const { leave_request_id } = useParams();

  const [formData, setFormData] = useState({
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadLeaveRequest = async () => {
      try {
        setLoading(true);
        setError("");

        const requests = await apiRequest("/leave-requests/my");

        const leaveRequest = requests.find(
          (request) => request.leave_request_id === Number(leave_request_id),
        );

        if (!leaveRequest) {
          setError("Leave request not found.");
          return;
        }

        if (leaveRequest.request_status.toLowerCase() !== "pending") {
          setError("Only pending leave requests can be updated.");
          return;
        }

        setFormData({
          leave_type: leaveRequest.leave_type,
          start_date: leaveRequest.start_date,
          end_date: leaveRequest.end_date,
          reason: leaveRequest.reason,
        });
      } catch (err) {
        setError(
          typeof err.message === "string"
            ? err.message
            : "Failed to load leave request.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadLeaveRequest();
  }, [leave_request_id]);

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
      const updatedRequest = await apiRequest(
        `/leave-requests/my/${leave_request_id}`,
        {
          method: "PUT",
          body: JSON.stringify(formData),
        },
      );

      setMessage("Leave request updated successfully.");

      setTimeout(() => {
        navigate("/student/leave-requests");
      }, 1000);
    } catch (err) {
      setError(
        typeof err.message === "string"
          ? err.message
          : "Failed to update leave request.",
      );
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-text">Loading leave request...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Update Leave Request</h1>
        <p>Update your pending leave request details.</p>
      </div>

      {message && <div className="message-success">{message}</div>}

      {error && <div className="message-error">{error}</div>}

      {!error && (
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
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <button type="submit" className="btn btn-primary">
              Update Leave Request
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/student/leave-requests")}
              style={{ marginLeft: "10px" }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default UpdateLeaveRequest;
