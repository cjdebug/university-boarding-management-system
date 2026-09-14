import { useNavigate } from "react-router-dom";

function OperationsManagement() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Boarding Operations</h1>
        <p>Review maintenance requests and student complaints.</p>
      </div>

      <div className="action-grid">
        <div
          className="action-card"
          onClick={() => navigate("/owner/maintenance-requests")}
        >
          <h3>Maintenance Requests</h3>
          <p>View maintenance issues reported by student residents.</p>
        </div>

        <div
          className="action-card"
          onClick={() => navigate("/owner/complaints")}
        >
          <h3>Student Complaints</h3>
          <p>Review complaints submitted by students.</p>
        </div>
      </div>
    </div>
  );
}

export default OperationsManagement;
