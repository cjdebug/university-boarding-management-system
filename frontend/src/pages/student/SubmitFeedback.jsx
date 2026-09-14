import { useState } from "react";
import { apiRequest } from "../../services/api";

function SubmitFeedback() {
  const [formData, setFormData] = useState({
    feedback_type: "",
    message: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccessMessage("");
    setError("");

    try {
      const dataToSend = {
        feedback_type: formData.feedback_type,
        message: formData.message,
      };

      const createdFeedback = await apiRequest("/feedback", {
        method: "POST",
        body: JSON.stringify(dataToSend),
      });

      setSuccessMessage(
        `Feedback submitted successfully. Feedback ID: ${createdFeedback.feedback_id}`,
      );

      setFormData({
        feedback_type: "",
        message: "",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Submit Feedback</h1>
        <p>Share feedback about your boarding experience.</p>
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
              <label>Feedback Type</label>

              <select
                name="feedback_type"
                value={formData.feedback_type}
                onChange={handleChange}
                required
              >
                <option value="">Select Feedback Type</option>
                <option value="Suggestion">Suggestion</option>
                <option value="Complaint">Complaint</option>
                <option value="Facilities">Facilities</option>
                <option value="Cleanliness">Cleanliness</option>
                <option value="Service">Service</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Message</label>

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your feedback here"
                required
              />
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          Submit Feedback
        </button>
      </form>
    </div>
  );
}

export default SubmitFeedback;
