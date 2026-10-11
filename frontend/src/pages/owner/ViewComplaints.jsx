import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";

function ViewComplaints() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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

  const filteredComplaints = complaints.filter((complaint) => {
    const search = searchTerm.trim().toLowerCase();

    const status = (complaint.complaint_status || "")
      .replace(/_/g, " ")
      .toLowerCase();

    return (
      (complaint.student_name || "").toLowerCase().includes(search) ||
      (complaint.room_number || "").toLowerCase().includes(search) ||
      (complaint.complaint_type || "").toLowerCase().includes(search) ||
      status.includes(search)
    );
  });

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

      {!error && (
        <div className="form-group">
          <label>Search Student Complaints</label>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, room number, complaint type, or status"
          />
        </div>
      )}

      {!error && complaints.length === 0 && (
        <div className="empty-state">No complaints found.</div>
      )}

      {!error && complaints.length > 0 && filteredComplaints.length === 0 && (
        <div className="empty-state">No complaints match your search.</div>
      )}

      {!error && filteredComplaints.length > 0 && (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Room Number</th>
                <th>Complaint Type</th>
                <th>Description</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredComplaints.map((complaint) => {
                const complaintStatus = complaint.complaint_status || "Unknown";

                const displayStatus = complaintStatus
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (letter) => letter.toUpperCase());

                return (
                  <tr key={complaint.complaint_id}>
                    <td>{complaint.student_name || "Unknown Student"}</td>

                    <td>{complaint.room_number || "Not Assigned"}</td>

                    <td>{complaint.complaint_type}</td>

                    <td>{complaint.description}</td>

                    <td>{complaint.complaint_date || "-"}</td>

                    <td>
                      <span
                        className={`status-badge status-${complaintStatus.toLowerCase()}`}
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
