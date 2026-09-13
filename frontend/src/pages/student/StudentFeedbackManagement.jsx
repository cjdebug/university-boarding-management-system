import { useNavigate } from "react-router-dom";

function StudentFeedbackManagement() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Student Feedback</h1>

      <p>Submit feedback and view your previous feedback.</p>

      <button onClick={() => navigate("/student/feedback/add")}>
        Submit Feedback
      </button>

      <button onClick={() => navigate("/student/feedback")}>My Feedback</button>
    </div>
  );
}

export default StudentFeedbackManagement;
