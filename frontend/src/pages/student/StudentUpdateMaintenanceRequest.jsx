import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../../services/api";

function StudentUpdateMaintenanceRequest() {
  const navigate = useNavigate();
  const { maintenance_request_id } = useParams();

  const [formData, setFormData] = useState({
    issue_type: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRequest = async () => {
      try {
        setLoading(true);
        setError("");

        const requestList = await apiRequest("/maintenance-requests/my");

        const request = requestList.find(
          (item) =>
            String(item.maintenance_request_id) ===
            String(maintenance_request_id),
        );

        if (!request) {
          setError("Maintenance request not found.");
          return;
        }

        if (request.request_status.toLowerCase() !== "pending") {
          setError("Only pending maintenance requests can be updated.");
          return;
        }

        setFormData({
          issue_type: request.issue_type,
          description: request.description,
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
      await apiRequest(`/maintenance-requests/my/${maintenance_request_id}`, {
        method: "PUT",
        body: JSON.stringify({
          issue_type: formData.issue_type,
          description: formData.description,
        }),
      });

      setMessage("Maintenance request updated successfully.");

      setTimeout(() => {
        navigate("/student/maintenance-requests");
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
        <p>Update your pending maintenance request.</p>
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
            </div>
          </div>

          <div>
            <button type="submit" className="btn btn-primary">
              Update Maintenance Request
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/student/maintenance-requests")}
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

export default StudentUpdateMaintenanceRequest;
