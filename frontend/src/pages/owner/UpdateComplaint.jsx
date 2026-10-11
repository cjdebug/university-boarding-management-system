import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../../services/api";

function UpdateComplaint() {
  const navigate = useNavigate();
  const { complaint_id } = useParams();

  const [formData, setFormData] = useState({
    student_name: "",
    room_number: "",
    complaint_type: "",
    description: "",
    complaint_status: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadComplaint = async () => {
      try {
        setLoading(true);
        setError("");

        const complaints = await apiRequest("/complaints");

        const complaint = complaints.find(
          (item) => String(item.complaint_id) === String(complaint_id),
        );

        if (!complaint) {
          setError("Complaint not found.");
          return;
        }

        setFormData({
          student_name: complaint.student_name || "Unknown Student",
          room_number: complaint.room_number || "Not Assigned",
          complaint_type: complaint.complaint_type,
          description: complaint.description,
          complaint_status: complaint.complaint_status,
        });
      } catch (err) {
        setError(
          typeof err.message === "string"
            ? err.message
            : "Failed to load complaint.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadComplaint();
  }, [complaint_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setSaving(true);

    try {
      await apiRequest(`/complaints/${complaint_id}`, {
        method: "PUT",
        body: JSON.stringify({
          complaint_status: formData.complaint_status,
        }),
      });

      setMessage("Complaint updated successfully.");

      setTimeout(() => {
        navigate("/owner/complaints");
      }, 1000);
    } catch (err) {
      setError(
        typeof err.message === "string"
          ? err.message
          : "Failed to update complaint.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-text">Loading complaint...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Update Complaint</h1>
        <p>Review the complaint and update its status.</p>
      </div>

      {message && <div className="message-success">{message}</div>}

      {error && <div className="message-error">{error}</div>}

      {!error && (
        <form onSubmit={handleSubmit} className="form-card">
          <div className="form-section">
            <h3>Complaint Details</h3>

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
                <label>Complaint Type</label>

                <input type="text" value={formData.complaint_type} readOnly />
              </div>

              <div className="form-group full-width">
                <label>Description</label>

                <textarea value={formData.description} readOnly />
              </div>

              <div className="form-group full-width">
                <label>Status</label>

                <select
                  name="complaint_status"
                  value={formData.complaint_status}
                  onChange={(e) =>
                    setFormData((current) => ({
                      ...current,
                      complaint_status: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Updating..." : "Update Complaint"}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/owner/complaints")}
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

export default UpdateComplaint;
