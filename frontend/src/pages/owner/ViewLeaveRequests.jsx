import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";

function ViewLeaveRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const data = await apiRequest("/leave-requests");
        setRequests(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, []);

  const handleDelete = async (leaveRequestId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this leave request?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setError("");

      await apiRequest(`/leave-requests/${leaveRequestId}`, {
        method: "DELETE",
      });

      setRequests((currentRequests) =>
        currentRequests.filter(
          (request) => request.leave_request_id !== leaveRequestId,
        ),
      );

      setMessage("Leave request deleted successfully.");
    } catch (err) {
      setError(err.message || "Failed to delete leave request.");
    }
  };

  const filteredRequests = requests.filter((request) => {
    const search = searchTerm.trim().toLowerCase();

    const displayStatus = (request.request_status || "")
      .replace(/_/g, " ")
      .toLowerCase();

    return (
      (request.student_name || "").toLowerCase().includes(search) ||
      (request.leave_type || "").toLowerCase().includes(search) ||
      displayStatus.includes(search)
    );
  });

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
        <h1>Leave Requests</h1>
        <p>Review leave requests submitted by student residents.</p>
      </div>

      {message && <div className="message-success">{message}</div>}
      {error && <div className="message-error">{error}</div>}

      {!error && (
        <div className="form-group">
          <label>Search Leave Requests</label>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, leave type, or status"
          />
        </div>
      )}

      {!error && requests.length === 0 && (
        <div className="empty-state">No leave requests found.</div>
      )}

      {!error && requests.length > 0 && filteredRequests.length === 0 && (
        <div className="empty-state">No leave requests match your search.</div>
      )}

      {!error && filteredRequests.length > 0 && (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredRequests.map((request) => {
                const requestStatus = request.request_status || "Unknown";

                const displayStatus = requestStatus
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (letter) => letter.toUpperCase());

                return (
                  <tr key={request.leave_request_id}>
                    <td>{request.student_name || "Unknown Student"}</td>

                    <td>{request.leave_type}</td>

                    <td>{request.start_date}</td>

                    <td>{request.end_date}</td>

                    <td>{request.reason}</td>

                    <td>
                      <span
                        className={`status-badge status-${requestStatus.toLowerCase()}`}
                      >
                        {displayStatus}
                      </span>
                    </td>

                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="table-action-btn table-action-edit"
                          onClick={() =>
                            navigate(
                              `/owner/leave-requests/${request.leave_request_id}/edit`,
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="table-action-btn table-action-delete"
                          onClick={() => handleDelete(request.leave_request_id)}
                        >
                          Delete
                        </button>
                      </div>
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

export default ViewLeaveRequests;
