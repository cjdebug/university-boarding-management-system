import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";

function ViewMaintenanceRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
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

  const filteredRequests = requests.filter((request) => {
    const search = searchTerm.trim().toLowerCase();

    const displayStatus = (request.request_status || "")
      .replace(/_/g, " ")
      .toLowerCase();

    return (
      (request.student_name || "").toLowerCase().includes(search) ||
      (request.room_number || "").toLowerCase().includes(search) ||
      (request.issue_type || "").toLowerCase().includes(search) ||
      displayStatus.includes(search)
    );
  });

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

      {!error && (
        <div className="form-group">
          <label>Search Maintenance Requests</label>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, room number, issue type, or status"
          />
        </div>
      )}

      {!error && requests.length === 0 && (
        <div className="empty-state">No maintenance requests found.</div>
      )}

      {!error && requests.length > 0 && filteredRequests.length === 0 && (
        <div className="empty-state">
          No maintenance requests match your search.
        </div>
      )}

      {!error && filteredRequests.length > 0 && (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Room Number</th>
                <th>Issue Type</th>
                <th>Description</th>
                <th>Request Date</th>
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
                  <tr key={request.maintenance_request_id}>
                    <td>{request.student_name || "Unknown Student"}</td>

                    <td>{request.room_number || "Unknown Room"}</td>

                    <td>{request.issue_type}</td>

                    <td>{request.description}</td>

                    <td>{request.request_date || "-"}</td>

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
