import { useNavigate } from "react-router-dom";

function CommunicationTurnoverManagement() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Communication & Turnover</h1>

      <p>Manage announcements, communication, and student feedback.</p>

      <button onClick={() => navigate("/owner/announcements/add")}>
        Create Announcement
      </button>

      <button onClick={() => navigate("/owner/announcements")}>
        View Announcements
      </button>

      <button onClick={() => navigate("/owner/feedback")}>
        View Student Feedback
      </button>
    </div>
  );
}

export default CommunicationTurnoverManagement;
