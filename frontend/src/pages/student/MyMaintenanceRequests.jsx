import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";

function MyMaintenanceRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await apiRequest("/maintenance-requests/my");
        setRequests(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  if (loading) {
    return <p>Loading maintenance requests...</p>;
  }

  return (
    <div>
      <h1>My Maintenance Requests</h1>

      {error && <p>{error}</p>}

      {!error && requests.length === 0 && <p>No maintenance requests found.</p>}

      {requests.length > 0 && (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Room ID</th>
              <th>Issue Type</th>
              <th>Description</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {requests.map((request) => (
              <tr key={request.maintenance_request_id}>
                <td>{request.maintenance_request_id}</td>
                <td>{request.room_id}</td>
                <td>{request.issue_type}</td>
                <td>{request.description}</td>
                <td>{request.request_date}</td>
                <td>{request.request_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MyMaintenanceRequests;
