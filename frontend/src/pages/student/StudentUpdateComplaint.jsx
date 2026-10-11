import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../../services/api";

function StudentUpdateComplaint() {
  const navigate = useNavigate();
  const { complaint_id } = useParams();

  const [formData, setFormData] = useState({
    complaint_type: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadComplaint = async () => {
      try {
        setLoading(true);
        setError("");

        const complaintList = await apiRequest("/complaints/my");

        const complaint = complaintList.find(
          (item) => String(item.complaint_id) === String(complaint_id),
        );

        if (!complaint) {
          setError("Complaint not found.");
          return;
        }

        if (complaint.complaint_status.toLowerCase() !== "pending") {
          setError("Only pending complaints can be updated.");
          return;
        }

        setFormData({
          complaint_type: complaint.complaint_type,
          description: complaint.description,
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
      await apiRequest(`/complaints/my/${complaint_id}`, {
        method: "PUT",
        body: JSON.stringify({
          complaint_type: formData.complaint_type,
          description: formData.description,
        }),
      });

      setMessage("Complaint updated successfully.");

      setTimeout(() => {
        navigate("/student/complaints");
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
        <p>Update your pending complaint.</p>
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

                <input
                  type="text"
                  name="complaint_type"
                  value={formData.complaint_type}
                  onChange={handleChange}
                  required
                />
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
              Update Complaint
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/student/complaints")}
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

export default StudentUpdateComplaint;
