import { useNavigate } from "react-router-dom";

function CommunicationTurnoverManagement() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Communication & Turnover</h1>
        <p>Manage announcements and review student feedback.</p>
      </div>

      <div className="action-grid">
        <div
          className="action-card"
          onClick={() => navigate("/owner/announcements/add")}
        >
          <h3>Create Announcement</h3>
          <p>Create a new announcement for student residents.</p>
        </div>

        <div
          className="action-card"
          onClick={() => navigate("/owner/announcements")}
        >
          <h3>View Announcements</h3>
          <p>Review previously created boarding announcements.</p>
        </div>

        <div
          className="action-card"
          onClick={() => navigate("/owner/feedback")}
        >
          <h3>Student Feedback</h3>
          <p>Review feedback submitted by student residents.</p>
        </div>
      </div>
    </div>
  );
}

export default CommunicationTurnoverManagement;
