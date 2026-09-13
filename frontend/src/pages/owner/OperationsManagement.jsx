import { useNavigate } from "react-router-dom";

function OperationsManagement() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Boarding Operations</h1>

      <p>View and manage boarding operational requests.</p>

      <button onClick={() => navigate("/owner/maintenance-requests")}>
        View Maintenance Requests
      </button>

      <button onClick={() => navigate("/owner/complaints")}>
        View Complaints
      </button>
    </div>
  );
}

export default OperationsManagement;
