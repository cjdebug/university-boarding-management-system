import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";

function ViewComplaints() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleDelete = async (complaintId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this complaint?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setError("");

      await apiRequest(`/complaints/${complaintId}`, {
        method: "DELETE",
      });

      setComplaints((currentComplaints) =>
        currentComplaints.filter(
          (complaint) => complaint.complaint_id !== complaintId,
        ),
      );

      setMessage("Complaint deleted successfully.");
    } catch (err) {
      setError(err.message);
    }
  };

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

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate("/owner/complaints/statistics")}
        >
          View Category Statistics
        </button>
      </div>

      {message && <div className="message-success">{message}</div>}

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
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {complaints.map((complaint) => {
                const status =
                  complaint.status || complaint.complaint_status || "Pending";

                const displayStatus = status
                  .replace("_", " ")
                  .replace(/\b\w/g, (letter) => letter.toUpperCase());

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
                        {displayStatus}
                      </span>
                    </td>

                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="table-action-btn table-action-edit"
                          onClick={() =>
                            navigate(
                              `/owner/complaints/${complaint.complaint_id}/edit`,
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="table-action-btn table-action-delete"
                          onClick={() => handleDelete(complaint.complaint_id)}
                        >
                          Delete
                        </button>
                      </div>
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
