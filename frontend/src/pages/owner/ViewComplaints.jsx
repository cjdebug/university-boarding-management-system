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
    return (
      <div className="page-container">
        <div className="loading-text">Loading complaints...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Student Complaints</h1>
        <p>Review complaints submitted by student residents.</p>
      </div>

      {error && <div className="message-error">{error}</div>}

      {!error && complaints.length === 0 && (
        <div className="empty-state">No complaints found.</div>
      )}

      {complaints.length > 0 && (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Complaint ID</th>
                <th>Student ID</th>
                <th>Complaint Type</th>
                <th>Description</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {complaints.map((complaint) => {
                const status =
                  complaint.status || complaint.complaint_status || "Pending";

                return (
                  <tr key={complaint.complaint_id}>
                    <td>{complaint.complaint_id}</td>
                    <td>{complaint.student_id}</td>
                    <td>{complaint.complaint_type}</td>
                    <td>{complaint.description}</td>
                    <td>{complaint.complaint_date || complaint.date || "-"}</td>

                    <td>
                      <span
                        className={`status-badge status-${status.toLowerCase()}`}
                      >
                        {status}
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

export default ViewComplaints;
