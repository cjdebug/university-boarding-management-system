import { useNavigate } from "react-router-dom";

function StudentFeedbackManagement() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Student Feedback</h1>
        <p>Submit feedback and review the feedback you have already sent.</p>
      </div>

      <div className="action-grid">
        <div
          className="action-card"
          onClick={() => navigate("/student/feedback/add")}
        >
          <h3>Submit Feedback</h3>
          <p>Share feedback about your boarding experience.</p>
        </div>

        <div
          className="action-card"
          onClick={() => navigate("/student/feedback")}
        >
          <h3>My Feedback</h3>
          <p>Review feedback you have previously submitted.</p>
        </div>
      </div>
    </div>
  );
}

export default StudentFeedbackManagement;
