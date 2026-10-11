import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";

function MyMaintenanceRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyRequests = async () => {
      try {
        const data = await apiRequest("/maintenance-requests/my");
        setRequests(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyRequests();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-text">Loading maintenance requests...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Maintenance Requests</h1>
        <p>Review the maintenance issues you have reported.</p>
      </div>

      {error && <div className="message-error">{error}</div>}

      {!error && requests.length === 0 && (
        <div className="empty-state">No maintenance requests found.</div>
      )}

      {requests.length > 0 && (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Issue Type</th>
                <th>Description</th>
                <th>Request Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((request) => {
                const status =
                  request.status || request.request_status || "Pending";

                const displayStatus = status
                  .replace("_", " ")
                  .replace(/\b\w/g, (letter) => letter.toUpperCase());

                return (
                  <tr key={request.maintenance_request_id}>
                    <td>{request.issue_type}</td>
                    <td>{request.description}</td>
                    <td>{request.request_date}</td>

                    <td>
                      <span
                        className={`status-badge status-${status.toLowerCase()}`}
                      >
                        {displayStatus}
                      </span>
                    </td>

                    <td>
                      {status.toLowerCase() === "pending" && (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() =>
                            navigate(
                              `/student/maintenance-requests/${request.maintenance_request_id}/update`,
                            )
                          }
                        >
                          Edit
                        </button>
                      )}
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

export default MyMaintenanceRequests;
