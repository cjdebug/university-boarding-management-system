import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";

function RoomMaintenanceHistory() {
  const [roomId, setRoomId] = useState("");
  const [rooms, setRooms] = useState([]);
  const [requests, setRequests] = useState([]);

  const [roomsLoading, setRoomsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  // Load all rooms from the database
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setRoomsLoading(true);

        const data = await apiRequest("/rooms");

        setRooms(
          [...data].sort((a, b) =>
            a.room_number.localeCompare(b.room_number, undefined, {
              numeric: true,
            }),
          ),
        );
      } catch (err) {
        setError(err.message || "Failed to load rooms.");
      } finally {
        setRoomsLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Clear previous history when selecting a different room
  const handleRoomChange = (event) => {
    setRoomId(event.target.value);
    setRequests([]);
    setSearched(false);
    setError("");
  };

  // Load maintenance history for the selected room
  const handleSearch = async (event) => {
    event.preventDefault();

    if (!roomId) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSearched(false);
      setRequests([]);

      const data = await apiRequest(
        `/maintenance-requests/room/${roomId}/history`,
      );

      setRequests(data);
      setSearched(true);
    } catch (err) {
      setRequests([]);
      setError(err.message || "Failed to load room maintenance history.");
    } finally {
      setLoading(false);
    }
  };

  const selectedRoom = rooms.find(
    (room) => String(room.room_id) === String(roomId),
  );

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
              <label htmlFor="maintenance-room">Room Number</label>

              <select
                id="maintenance-room"
                value={roomId}
                onChange={handleRoomChange}
                required
                disabled={roomsLoading || loading}
              >
                <option value="">
                  {roomsLoading ? "Loading rooms..." : "Select Room"}
                </option>

                {rooms.map((room) => (
                  <option key={room.room_id} value={room.room_id}>
                    {room.room_number}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={roomsLoading || loading || !roomId}
        >
          {loading ? "Loading..." : "View History"}
        </button>
      </form>

      {error && <div className="message-error">{error}</div>}

      {searched && !loading && !error && requests.length === 0 && (
        <div className="empty-state">
          No maintenance requests found for Room{" "}
          {selectedRoom?.room_number || roomId}.
        </div>
      )}

      {!loading && !error && requests.length > 0 && (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Name</th>
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
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (letter) => letter.toUpperCase());

                return (
                  <tr key={request.maintenance_request_id}>
                    <td>{request.student_name || "Unknown Student"}</td>

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
