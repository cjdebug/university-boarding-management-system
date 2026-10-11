import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../../services/api";

function UpdateMaintenanceRequest() {
  const navigate = useNavigate();
  const { maintenance_request_id } = useParams();

  const [formData, setFormData] = useState({
    student_name: "",
    room_number: "",
    issue_type: "",
    description: "",
    request_status: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
            String(item.maintenance_request_id) ===
            String(maintenance_request_id),
        );

        if (!request) {
          setError("Maintenance request not found.");
          return;
        }

        setFormData({
          student_name: request.student_name || "Unknown Student",
          room_number: request.room_number || "Unknown Room",
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setSaving(true);

    try {
      await apiRequest(`/maintenance-requests/${maintenance_request_id}`, {
        method: "PUT",
        body: JSON.stringify({
          request_status: formData.request_status,
        }),
      });

      setMessage("Maintenance request updated successfully.");

      navigate("/owner/maintenance-requests");
    } catch (err) {
      setError(
        typeof err.message === "string"
          ? err.message
          : "Failed to update maintenance request.",
      );
    } finally {
      setSaving(false);
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
        <p>Review the maintenance request and update its status.</p>
      </div>

      {message && <div className="message-success">{message}</div>}

      {error && <div className="message-error">{error}</div>}

      {!error && (
        <form onSubmit={handleSubmit} className="form-card">
          <div className="form-section">
            <h3>Maintenance Details</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>Student</label>

                <input type="text" value={formData.student_name} readOnly />
              </div>

              <div className="form-group">
                <label>Room Number</label>

                <input type="text" value={formData.room_number} readOnly />
              </div>

              <div className="form-group full-width">
                <label>Issue Type</label>

                <input type="text" value={formData.issue_type} readOnly />
              </div>

              <div className="form-group full-width">
                <label>Description</label>

                <textarea value={formData.description} readOnly />
              </div>

              <div className="form-group full-width">
                <label>Status</label>

                <select
                  name="request_status"
                  value={formData.request_status}
                  onChange={(e) =>
                    setFormData((current) => ({
                      ...current,
                      request_status: e.target.value,
                    }))
                  }
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
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Updating..." : "Update Maintenance Request"}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/owner/maintenance-requests")}
              disabled={saving}
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
