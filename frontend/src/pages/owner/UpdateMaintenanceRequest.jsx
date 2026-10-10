import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../../services/api";

function UpdateMaintenanceRequest() {
  const navigate = useNavigate();
  const { maintenance_request_id } = useParams();

  const [formData, setFormData] = useState({
    issue_type: "",
    description: "",
    request_status: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRequest = async () => {
      try {
        setLoading(true);
        setError("");

        const requests = await apiRequest("/maintenance-requests");

        const request = requests.find(
          (item) =>
            item.maintenance_request_id === Number(maintenance_request_id),
        );

        if (!request) {
          setError("Maintenance request not found.");
          return;
        }

        setFormData({
          issue_type: request.issue_type,
          description: request.description,
          request_status: request.request_status,
        });
      } catch (err) {
        setError(
          typeof err.message === "string"
            ? err.message
            : "Failed to load maintenance request.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadRequest();
  }, [maintenance_request_id]);

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
        `/maintenance-requests/${maintenance_request_id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            issue_type: formData.issue_type,
            description: formData.description,
            request_status: formData.request_status,
          }),
        },
      );

      setMessage(
        `Maintenance request updated successfully. Request ID: ${updatedRequest.maintenance_request_id}`,
      );

      setTimeout(() => {
        navigate("/owner/maintenance-requests");
      }, 1000);
    } catch (err) {
      setError(
        typeof err.message === "string"
          ? err.message
          : "Failed to update maintenance request.",
      );
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-text">Loading maintenance request...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Update Maintenance Request</h1>
        <p>Update a maintenance request and its current status.</p>
      </div>

      {message && <div className="message-success">{message}</div>}

      {error && <div className="message-error">{error}</div>}

      {!error && (
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
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Status</label>

                <select
                  name="request_status"
                  value={formData.request_status}
                  onChange={handleChange}
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <button type="submit" className="btn btn-primary">
              Update Maintenance Request
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/owner/maintenance-requests")}
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

export default UpdateMaintenanceRequest;
