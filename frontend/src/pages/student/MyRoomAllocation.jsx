import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";

function MyRoomAllocation() {
  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyAllocation = async () => {
      try {
        const data = await apiRequest("/room-allocations/my");
        setAllocation(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyAllocation();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-text">Loading room allocation...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Room & Allocation</h1>
        <p>View your current boarding room and allocation details.</p>
      </div>

      {error && <div className="message-error">{error}</div>}

      {!error && !allocation && (
        <div className="empty-state">No active room allocation found.</div>
      )}

      {allocation && (
        <div className="form-card">
          <div className="form-section">
            <h3>Current Allocation</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>Allocation ID</label>
                <p>{allocation.allocation_id}</p>
              </div>

              <div className="form-group">
                <label>Room ID</label>
                <p>{allocation.room_id}</p>
              </div>

              <div className="form-group">
                <label>Bed Number</label>
                <p>{allocation.bed_number || "-"}</p>
              </div>

              <div className="form-group">
                <label>Allocation Date</label>
                <p>{allocation.allocation_date}</p>
              </div>

              <div className="form-group">
                <label>Expected Checkout</label>
                <p>{allocation.expected_checkout_date || "-"}</p>
              </div>

              <div className="form-group">
                <label>Status</label>

                <p>
                  <span
                    className={`status-badge status-${allocation.allocation_status}`}
                  >
                    {allocation.allocation_status}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyRoomAllocation;
