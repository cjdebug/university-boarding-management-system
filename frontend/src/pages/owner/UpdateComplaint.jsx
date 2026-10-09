import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../../services/api";

function UpdateComplaint() {
  const navigate = useNavigate();
  const { complaint_id } = useParams();

  const [formData, setFormData] = useState({
    complaint_type: "",
    description: "",
    complaint_status: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadComplaint = async () => {
      try {
        setLoading(true);
        setError("");

        const complaints = await apiRequest("/complaints");

        const complaint = complaints.find(
          (item) => item.complaint_id === Number(complaint_id),
        );

        if (!complaint) {
          setError("Complaint not found.");
          return;
        }

        setFormData({
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
      const updatedComplaint = await apiRequest(`/complaints/${complaint_id}`, {
        method: "PUT",
        body: JSON.stringify({
          complaint_type: formData.complaint_type,
          description: formData.description,
          complaint_status: formData.complaint_status,
        }),
      });

      setMessage(
        `Complaint updated successfully. Complaint ID: ${updatedComplaint.complaint_id}`,
      );

      setTimeout(() => {
        navigate("/owner/complaints");
      }, 1000);
    } catch (err) {
      setError(
        typeof err.message === "string"
          ? err.message
          : "Failed to update complaint.",
      );
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
        <p>Update a complaint and its current status.</p>
      </div>

      {message && <div className="message-success">{message}</div>}

      {error && <div className="message-error">{error}</div>}

      {!error && (
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
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Status</label>

                <select
                  name="complaint_status"
                  value={formData.complaint_status}
                  onChange={handleChange}
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
            <button type="submit" className="btn btn-primary">
              Update Complaint
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/owner/complaints")}
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
