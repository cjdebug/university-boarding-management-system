import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";

function ViewFeedback() {
  const navigate = useNavigate();

  const [feedbackList, setFeedbackList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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

  const handleDelete = async (feedbackId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this feedback?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setError("");

      await apiRequest(`/feedback/${feedbackId}`, {
        method: "DELETE",
      });

      setFeedbackList((currentFeedback) =>
        currentFeedback.filter(
          (feedback) => feedback.feedback_id !== feedbackId,
        ),
      );

      setMessage("Feedback deleted successfully.");
    } catch (err) {
      setError(err.message);
    }
  };

  // Search by student name, feedback type, or status
  const filteredFeedback = feedbackList.filter((feedback) => {
    const search = searchTerm.trim().toLowerCase();

    const studentName = (feedback.student_name || "").toLowerCase();

    const feedbackType = (feedback.feedback_type || "").toLowerCase();

    const feedbackStatus = (
      feedback.feedback_status ||
      feedback.status ||
      ""
    ).toLowerCase();

    return (
      studentName.includes(search) ||
      feedbackType.includes(search) ||
      feedbackStatus.includes(search)
    );
  });

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

      {message && <div className="message-success">{message}</div>}

      {error && <div className="message-error">{error}</div>}

      {!error && (
        <div className="form-group">
          <label htmlFor="search-feedback">Search Student Feedback</label>

          <input
            id="search-feedback"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, feedback type, or status"
          />
        </div>
      )}

      {!error && feedbackList.length === 0 && (
        <div className="empty-state">No feedback found.</div>
      )}

      {!error && feedbackList.length > 0 && filteredFeedback.length === 0 && (
        <div className="empty-state">
          No feedback records match your search.
        </div>
      )}

      {!error && filteredFeedback.length > 0 && (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Feedback Type</th>
                <th>Message</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredFeedback.map((feedback) => {
                const feedbackStatus =
                  feedback.feedback_status || feedback.status || "Submitted";

                const displayStatus = feedbackStatus
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (letter) => letter.toUpperCase());

                return (
                  <tr key={feedback.feedback_id}>
                    <td>{feedback.student_name || "Unknown Student"}</td>

                    <td>{feedback.feedback_type}</td>

                    <td>{feedback.message}</td>

                    <td>{feedback.feedback_date || "-"}</td>

                    <td>
                      <span
                        className={`status-badge status-${feedbackStatus.toLowerCase()}`}
                      >
                        {displayStatus}
                      </span>
                    </td>

                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="table-action-btn table-action-edit"
                          onClick={() =>
                            navigate(
                              `/owner/feedback/${feedback.feedback_id}/edit`,
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="table-action-btn table-action-delete"
                          onClick={() => handleDelete(feedback.feedback_id)}
                        >
                          Delete
                        </button>
                      </div>
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
