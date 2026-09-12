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
    return <p>Loading room allocations...</p>;
  }

  return (
    <div>
      <h1>Room Allocations</h1>

      {error && <p>{error}</p>}

      {!error && allocations.length === 0 && <p>No room allocations found.</p>}

      {allocations.length > 0 && (
        <table border="1" cellPadding="10">
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
                <td>{allocation.allocation_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ViewRoomAllocations;
