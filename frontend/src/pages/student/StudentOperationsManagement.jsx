import { useNavigate } from "react-router-dom";

function StudentOperationsManagement() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>My Requests</h1>

      <p>Submit and view boarding maintenance requests.</p>

      <button onClick={() => navigate("/student/maintenance-request")}>
        Submit Maintenance Request
      </button>

      <button onClick={() => navigate("/student/maintenance-requests")}>
        My Maintenance Requests
      </button>

      <button onClick={() => navigate("/student/complaint")}>
        Submit Complaint
      </button>

      <button onClick={() => navigate("/student/complaints")}>
        My Complaints
      </button>
    </div>
  );
}

export default StudentOperationsManagement;
