import { useState } from "react";
import { apiRequest } from "../../services/api";

function RoomMaintenanceHistory() {
  const [roomId, setRoomId] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (event) => {
    event.preventDefault();

    if (!roomId) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSearched(false);

      const data = await apiRequest(
        `/maintenance-requests/room/${roomId}/history`,
      );

      setRequests(data);
      setSearched(true);
    } catch (err) {
      setError(err.message || "Failed to load room maintenance history.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Room Maintenance History</h1>
        <p>View previous maintenance requests recorded for a specific room.</p>
      </div>

      <form onSubmit={handleSearch} className="form-card">
        <div className="form-section">
          <h3>Select Room</h3>

          <div className="form-grid">
            <div className="form-group">
              <label>Room ID</label>

              <input
                type="number"
                value={roomId}
                onChange={(event) => setRoomId(event.target.value)}
                min="1"
                placeholder="Enter room ID"
                required
              />
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          View History
        </button>
      </form>

      {loading && (
        <div className="loading-text">Loading maintenance history...</div>
      )}

      {error && <div className="message-error">{error}</div>}

      {searched && !loading && !error && requests.length === 0 && (
        <div className="empty-state">
          No maintenance requests found for Room {roomId}.
        </div>
      )}

      {requests.length > 0 && !loading && (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Student ID</th>
                <th>Issue Type</th>
                <th>Description</th>
                <th>Request Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((request) => {
                const status = request.request_status || "Pending";

                const displayStatus = status
                  .replace("_", " ")
                  .replace(/\b\w/g, (letter) => letter.toUpperCase());

                return (
                  <tr key={request.maintenance_request_id}>
                    <td>{request.maintenance_request_id}</td>
                    <td>{request.student_id}</td>
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

export default RoomMaintenanceHistory;
