import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";

function ViewRoomAllocations() {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAllocations = async () => {
      try {
        const data = await apiRequest("/room-allocations");
        setAllocations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllocations();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-text">Loading room allocations...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Room Allocations</h1>
        <p>Review current student room and bed assignments.</p>
      </div>

      {error && <div className="message-error">{error}</div>}

      {!error && allocations.length === 0 && (
        <div className="empty-state">No room allocations found.</div>
      )}

      {allocations.length > 0 && (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Allocation ID</th>
                <th>Student ID</th>
                <th>Room ID</th>
                <th>Bed Number</th>
                <th>Allocation Date</th>
                <th>Expected Checkout</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {allocations.map((allocation) => (
                <tr key={allocation.allocation_id}>
                  <td>{allocation.allocation_id}</td>
                  <td>{allocation.student_id}</td>
                  <td>{allocation.room_id}</td>
                  <td>{allocation.bed_number || "-"}</td>
                  <td>{allocation.allocation_date}</td>
                  <td>{allocation.expected_checkout_date || "-"}</td>

                  <td>
                    <span
                      className={`status-badge status-${allocation.allocation_status}`}
                    >
                      {allocation.allocation_status}
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

export default ViewRoomAllocations;
