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
    return <p>Loading room allocation...</p>;
  }

  if (error) {
    return (
      <div>
        <h1>My Room & Allocation</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>My Room & Allocation</h1>

      {allocation && (
        <div>
          <p>
            <strong>Allocation ID:</strong> {allocation.allocation_id}
          </p>
          <p>
            <strong>Room ID:</strong> {allocation.room_id}
          </p>
          <p>
            <strong>Bed Number:</strong> {allocation.bed_number || "-"}
          </p>
          <p>
            <strong>Allocation Date:</strong> {allocation.allocation_date}
          </p>
          <p>
            <strong>Expected Checkout:</strong>{" "}
            {allocation.expected_checkout_date || "-"}
          </p>
          <p>
            <strong>Status:</strong> {allocation.allocation_status}
          </p>
        </div>
      )}
    </div>
  );
}

export default MyRoomAllocation;
