import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";

function ViewComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const data = await apiRequest("/complaints");
        setComplaints(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  if (loading) {
    return <p>Loading complaints...</p>;
  }

  return (
    <div>
      <h1>Complaints</h1>

      {error && <p>{error}</p>}

      {!error && complaints.length === 0 && <p>No complaints found.</p>}

      {complaints.length > 0 && (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Complaint ID</th>
              <th>Student ID</th>
              <th>Type</th>
              <th>Description</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {complaints.map((complaint) => (
              <tr key={complaint.complaint_id}>
                <td>{complaint.complaint_id}</td>
                <td>{complaint.student_id}</td>
                <td>{complaint.complaint_type}</td>
                <td>{complaint.description}</td>
                <td>{complaint.complaint_date}</td>
                <td>{complaint.complaint_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ViewComplaints;
