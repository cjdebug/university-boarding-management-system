import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";

function ViewMaintenanceRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await apiRequest("/maintenance-requests");
        setRequests(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleDelete = async (maintenanceRequestId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this maintenance request?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setError("");

      await apiRequest(`/maintenance-requests/${maintenanceRequestId}`, {
        method: "DELETE",
      });

      setRequests((currentRequests) =>
        currentRequests.filter(
          (request) => request.maintenance_request_id !== maintenanceRequestId,
        ),
      );

      setMessage("Maintenance request deleted successfully.");
    } catch (err) {
      setError(err.message);
    }
  };

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
        <h1>Maintenance Requests</h1>
        <p>Review maintenance issues reported by student residents.</p>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate("/owner/maintenance-requests/room-history")}
        >
          View Room Maintenance History
        </button>
      </div>

      {message && <div className="message-success">{message}</div>}

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
                <th>Student ID</th>
                <th>Room ID</th>
                <th>Issue Type</th>
                <th>Description</th>
                <th>Request Date</th>
                <th>Status</th>
                <th>Actions</th>
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
                    <td>{request.maintenance_request_id}</td>

                    <td>{request.student_id}</td>

                    <td>{request.room_id}</td>

                    <td>{request.issue_type}</td>

                    <td>{request.description}</td>

                    <td>{request.request_date || "-"}</td>

                    <td>
                      <span
                        className={`status-badge status-${status.toLowerCase()}`}
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
                              `/owner/maintenance-requests/${request.maintenance_request_id}/edit`,
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="table-action-btn table-action-delete"
                          onClick={() =>
                            handleDelete(request.maintenance_request_id)
                          }
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

export default ViewMaintenanceRequests;
