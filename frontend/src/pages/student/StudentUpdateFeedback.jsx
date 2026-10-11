import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../../services/api";

function UpdateFeedback() {
  const navigate = useNavigate();
  const { feedback_id } = useParams();

  const [formData, setFormData] = useState({
    feedback_type: "",
    message: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        setLoading(true);
        setError("");

        const feedbackList = await apiRequest("/feedback/my");

        const feedback = feedbackList.find(
          (item) => String(item.feedback_id) === String(feedback_id),
        );

        if (!feedback) {
          setError("Feedback not found.");
          return;
        }

        if (feedback.feedback_status.toLowerCase() !== "submitted") {
          setError("Only submitted feedback can be updated.");
          return;
        }

        setFormData({
          feedback_type: feedback.feedback_type,
          message: feedback.message,
        });
      } catch (err) {
        setError(
          typeof err.message === "string"
            ? err.message
            : "Failed to load feedback.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadFeedback();
  }, [feedback_id]);

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
      await apiRequest(`/feedback/my/${feedback_id}`, {
        method: "PUT",
        body: JSON.stringify({
          feedback_type: formData.feedback_type,
          message: formData.message,
        }),
      });

      setMessage("Feedback updated successfully.");

      setTimeout(() => {
        navigate("/student/feedback");
      }, 1000);
    } catch (err) {
      setError(
        typeof err.message === "string"
          ? err.message
          : "Failed to update feedback.",
      );
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-text">Loading feedback...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Update Feedback</h1>
        <p>Update your submitted feedback.</p>
      </div>

      {message && <div className="message-success">{message}</div>}

      {error && <div className="message-error">{error}</div>}

      {!error && (
        <form onSubmit={handleSubmit} className="form-card">
          <div className="form-section">
            <h3>Feedback Details</h3>

            <div className="form-grid">
              <div className="form-group full-width">
                <label>Feedback Type</label>

                <select
                  name="feedback_type"
                  value={formData.feedback_type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Feedback Type</option>
                  <option value="Suggestion">Suggestion</option>
                  <option value="Cleanliness">Cleanliness</option>
                  <option value="Service">Service</option>
                  <option value="Facilities">Facilities</option>
                  <option value="Food">Food</option>
                  <option value="Other">Other</option>
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
            </div>
          </div>

          <div>
            <button type="submit" className="btn btn-primary">
              Update Feedback
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/student/feedback")}
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

export default UpdateFeedback;
