import { useNavigate } from "react-router-dom";

function StudentOperationsManagement() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Boarding Operations</h1>
        <p>Submit and review maintenance requests and complaints.</p>
      </div>

      <div className="action-grid">
        <div
          className="action-card"
          onClick={() => navigate("/student/maintenance-request")}
        >
          <h3>Submit Maintenance Request</h3>
          <p>Report a maintenance issue in your assigned room.</p>
        </div>

        <div
          className="action-card"
          onClick={() => navigate("/student/maintenance-requests")}
        >
          <h3>My Maintenance Requests</h3>
          <p>Review the maintenance requests you have submitted.</p>
        </div>

        <div
          className="action-card"
          onClick={() => navigate("/student/complaint")}
        >
          <h3>Submit Complaint</h3>
          <p>Submit a complaint related to your boarding experience.</p>
        </div>

        <div
          className="action-card"
          onClick={() => navigate("/student/complaints")}
        >
          <h3>My Complaints</h3>
          <p>Review the complaints you have submitted.</p>
        </div>
      </div>
    </div>
  );
}

export default StudentOperationsManagement;
