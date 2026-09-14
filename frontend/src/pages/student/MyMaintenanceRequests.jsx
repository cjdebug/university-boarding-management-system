import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";

function MyMaintenanceRequests() {
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
                <th>Request ID</th>
                <th>Room ID</th>
                <th>Issue Type</th>
                <th>Description</th>
                <th>Request Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((request) => {
                const status = request.status || "Pending";

                return (
                  <tr key={request.maintenance_request_id}>
                    <td>{request.maintenance_request_id}</td>
                    <td>{request.room_id}</td>
                    <td>{request.issue_type}</td>
                    <td>{request.description}</td>
                    <td>{request.request_date}</td>

                    <td>
                      <span
                        className={`status-badge status-${status.toLowerCase()}`}
                      >
                        {status}
                      </span>
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
