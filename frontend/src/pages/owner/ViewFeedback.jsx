import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";

function ViewFeedback() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const data = await apiRequest("/feedback");
        setFeedbackList(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-text">Loading student feedback...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Student Feedback</h1>
        <p>Review feedback submitted by student residents.</p>
      </div>

      {error && <div className="message-error">{error}</div>}

      {!error && feedbackList.length === 0 && (
        <div className="empty-state">No feedback found.</div>
      )}

      {feedbackList.length > 0 && (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Feedback ID</th>
                <th>Student ID</th>
                <th>Feedback Type</th>
                <th>Message</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {feedbackList.map((feedback) => {
                const status =
                  feedback.feedback_status || feedback.status || "Submitted";

                return (
                  <tr key={feedback.feedback_id}>
                    <td>{feedback.feedback_id}</td>
                    <td>{feedback.student_id}</td>
                    <td>{feedback.feedback_type}</td>
                    <td>{feedback.message}</td>
                    <td>{feedback.feedback_date || "-"}</td>

                    <td>
                      <span
                        className={`status-badge status-${status.toLowerCase()}`}
                      >
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ViewFeedback;
