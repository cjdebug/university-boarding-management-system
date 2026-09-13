import { useState } from "react";
import { apiRequest } from "../../services/api";

function SubmitFeedback() {
  const [formData, setFormData] = useState({
    feedback_type: "",
    message: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
      const createdFeedback = await apiRequest("/feedback", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      setMessage(
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
    <div>
      <h1>Submit Feedback</h1>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Feedback Type</label>
          <br />

          <select
            name="feedback_type"
            value={formData.feedback_type}
            onChange={handleChange}
            required
          >
            <option value="">Select Feedback Type</option>
            <option value="Facilities">Facilities</option>
            <option value="Cleanliness">Cleanliness</option>
            <option value="Services">Services</option>
            <option value="Safety">Safety</option>
            <option value="General">General</option>
          </select>
        </div>

        <div>
          <label>Message</label>
          <br />

          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <button type="submit">Submit Feedback</button>
      </form>
    </div>
  );
}

export default SubmitFeedback;
