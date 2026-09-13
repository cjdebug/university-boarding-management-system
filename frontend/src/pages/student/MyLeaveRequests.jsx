import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";

function MyLeaveRequests() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const data = await apiRequest("/leave-requests/my");
        setLeaveRequests(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, []);

  if (loading) {
    return <p>Loading leave requests...</p>;
  }

  return (
    <div>
      <h1>My Leave Requests</h1>

      {error && <p>{error}</p>}

      {!error && leaveRequests.length === 0 && <p>No leave requests found.</p>}

      {leaveRequests.length > 0 && (
        <table border="1" cellPadding="10">
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
            {leaveRequests.map((request) => (
              <tr key={request.leave_request_id}>
                <td>{request.leave_request_id}</td>
                <td>{request.leave_type}</td>
                <td>{request.start_date}</td>
                <td>{request.end_date}</td>
                <td>{request.reason}</td>
                <td>{request.request_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MyLeaveRequests;
