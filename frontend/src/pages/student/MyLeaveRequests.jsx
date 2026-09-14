import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";

function MyLeaveRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyLeaveRequests = async () => {
      try {
        const data = await apiRequest("/leave-requests/my");
        setRequests(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyLeaveRequests();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-text">Loading leave requests...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Leave Requests</h1>
        <p>Review the leave requests you have submitted.</p>
      </div>

      {error && <div className="message-error">{error}</div>}

      {!error && requests.length === 0 && (
        <div className="empty-state">No leave requests found.</div>
      )}

      {requests.length > 0 && (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((request) => (
                <tr key={request.leave_request_id}>
                  <td>{request.leave_request_id}</td>
                  <td>{request.leave_type}</td>
                  <td>{request.start_date}</td>
                  <td>{request.end_date}</td>
                  <td>{request.reason}</td>

                  <td>
                    <span
                      className={`status-badge status-${request.request_status.toLowerCase()}`}
                    >
                      {request.request_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MyLeaveRequests;
