import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";

function ViewFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const data = await apiRequest("/feedback");
        setFeedback(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  if (loading) {
    return <p>Loading feedback...</p>;
  }

  return (
    <div>
      <h1>Student Feedback</h1>

      {error && <p>{error}</p>}

      {!error && feedback.length === 0 && <p>No feedback found.</p>}

      {feedback.length > 0 && (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Feedback ID</th>
              <th>Student ID</th>
              <th>Type</th>
              <th>Message</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {feedback.map((item) => (
              <tr key={item.feedback_id}>
                <td>{item.feedback_id}</td>
                <td>{item.student_id}</td>
                <td>{item.feedback_type}</td>
                <td>{item.message}</td>
                <td>{item.feedback_date}</td>
                <td>{item.feedback_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ViewFeedback;
