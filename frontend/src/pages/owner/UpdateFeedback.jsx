import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../../services/api";

function UpdateFeedback() {
  const navigate = useNavigate();
  const { feedbackId } = useParams();

  const [formData, setFormData] = useState({
    student_name: "",
    feedback_type: "",
    message: "",
    feedback_date: "",
    feedback_status: "submitted",
    owner_response: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        setError("");
        setNotFound(false);

        const data = await apiRequest("/feedback");

        const feedback = data.find(
          (item) => String(item.feedback_id) === String(feedbackId),
        );

        if (!feedback) {
          setNotFound(true);
          setError("Feedback not found.");
          return;
        }

        setFormData({
          student_name: feedback.student_name || "Unknown Student",
          feedback_type: feedback.feedback_type,
          message: feedback.message,
          feedback_date: feedback.feedback_date,
          feedback_status: feedback.feedback_status || "submitted",
          owner_response: feedback.owner_response || "",
        });
      } catch (err) {
        setNotFound(true);
        setError(err.message || "Failed to load feedback.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [feedbackId]);

  const handleChange = (e) => {
    setFormData((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      await apiRequest(`/feedback/${feedbackId}`, {
        method: "PUT",
        body: JSON.stringify({
          feedback_status: formData.feedback_status,
          owner_response: formData.owner_response.trim() || null,
        }),
      });

      setSuccessMessage("Feedback updated successfully.");

      setTimeout(() => {
        navigate("/owner/feedback");
      }, 1000);
    } catch (err) {
      setError(err.message || "Failed to update feedback.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-text">Loading feedback...</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Update Feedback</h1>
        </div>

        <div className="message-error">{error}</div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate("/owner/feedback")}
        >
          Back to Feedback
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Update Feedback</h1>
        <p>
          Review student feedback, update its status, and respond to the
          student.
        </p>
      </div>

      {successMessage && (
        <div className="message-success">{successMessage}</div>
      )}

      {error && <div className="message-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-section">
          <h3>Feedback Details</h3>

          <div className="form-grid">
            <div className="form-group full-width">
              <label>Student Name</label>

              <input type="text" value={formData.student_name} readOnly />
            </div>

            <div className="form-group">
              <label>Feedback Type</label>

              <input type="text" value={formData.feedback_type} readOnly />
            </div>

            <div className="form-group">
              <label>Status</label>

              <select
                name="feedback_status"
                value={formData.feedback_status}
                onChange={handleChange}
                required
              >
                <option value="submitted">Submitted</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Message</label>

              <textarea value={formData.message} readOnly />
            </div>

            <div className="form-group full-width">
              <label>Owner Response</label>

              <textarea
                name="owner_response"
                value={formData.owner_response}
                onChange={handleChange}
                placeholder="Write a response to the student"
                rows={4}
              />
            </div>

            <div className="form-group">
              <label>Feedback Date</label>

              <input type="date" value={formData.feedback_date} readOnly />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Updating..." : "Update Feedback"}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/owner/feedback")}
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default UpdateFeedback;
