import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../../services/api";

function UpdateFeedback() {
  const navigate = useNavigate();
  const { feedbackId } = useParams();

  const [formData, setFormData] = useState({
    feedback_id: "",
    student_id: "",
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

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest("/feedback");

        const feedback = data.find(
          (item) => item.feedback_id === Number(feedbackId),
        );

        if (!feedback) {
          setError("Feedback not found.");
          return;
        }

        setFormData({
          feedback_id: feedback.feedback_id,
          student_id: feedback.student_id,
          feedback_type: feedback.feedback_type,
          message: feedback.message,
          feedback_date: feedback.feedback_date,
          feedback_status: feedback.feedback_status || "submitted",
          owner_response: feedback.owner_response || "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [feedbackId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const updatedFeedback = await apiRequest(`/feedback/${feedbackId}`, {
        method: "PUT",
        body: JSON.stringify({
          feedback_id: Number(formData.feedback_id),
          student_id: Number(formData.student_id),
          feedback_type: formData.feedback_type,
          message: formData.message,
          feedback_date: formData.feedback_date,
          feedback_status: formData.feedback_status,
          owner_response: formData.owner_response,
        }),
      });

      setSuccessMessage(
        `Feedback ${updatedFeedback.feedback_id} updated successfully.`,
      );

      setTimeout(() => {
        navigate("/owner/feedback");
      }, 1000);
    } catch (err) {
      setError(err.message);
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

  if (error && !formData.feedback_id) {
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
        <p>Update student feedback and change its status.</p>
      </div>

      {successMessage && (
        <div className="message-success">{successMessage}</div>
      )}

      {error && <div className="message-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-section">
          <h3>Feedback Details</h3>

          <div className="form-grid">
            <div className="form-group">
              <label>Feedback ID</label>

              <input type="text" value={formData.feedback_id} disabled />
            </div>

            <div className="form-group">
              <label>Student ID</label>

              <input type="text" value={formData.student_id} disabled />
            </div>

            <div className="form-group">
              <label>Feedback Type</label>

              <select
                name="feedback_type"
                value={formData.feedback_type}
                onChange={handleChange}
                required
              >
                <option value="Suggestion">Suggestion</option>

                <option value="Complaint">Complaint</option>

                <option value="Facilities">Facilities</option>

                <option value="Cleanliness">Cleanliness</option>

                <option value="Service">Service</option>

                <option value="Other">Other</option>
              </select>
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

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Owner Response</label>

              <textarea
                name="owner_response"
                value={formData.owner_response}
                onChange={handleChange}
                placeholder="Write a response to the student"
              />
            </div>

            <div className="form-group">
              <label>Feedback Date</label>

              <input type="date" value={formData.feedback_date} disabled />
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
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default UpdateFeedback;
