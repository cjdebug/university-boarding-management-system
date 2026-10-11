import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../../services/api";

function UpdateLeaveRequest() {
  const navigate = useNavigate();
  const { leave_request_id } = useParams();

  const [students, setStudents] = useState([]);

  const [formData, setFormData] = useState({
    student_id: "",
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
    request_status: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [studentsData, leaveRequests] = await Promise.all([
          apiRequest("/students"),
          apiRequest("/leave-requests"),
        ]);

        setStudents(studentsData);

        const leaveRequest = leaveRequests.find(
          (request) =>
            String(request.leave_request_id) === String(leave_request_id),
        );

        if (!leaveRequest) {
          setError("Leave request not found.");
          return;
        }

        setFormData({
          student_id: String(leaveRequest.student_id),
          leave_type: leaveRequest.leave_type,
          start_date: leaveRequest.start_date,
          end_date: leaveRequest.end_date,
          reason: leaveRequest.reason,
          request_status: leaveRequest.request_status,
        });
      } catch (err) {
        setError(
          typeof err.message === "string"
            ? err.message
            : "Failed to load leave request.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [leave_request_id]);

  const selectedStudent = students.find(
    (student) => String(student.student_id) === String(formData.student_id),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      await apiRequest(`/leave-requests/${leave_request_id}`, {
        method: "PUT",
        body: JSON.stringify({
          request_status: formData.request_status,
        }),
      });

      setMessage("Leave request updated successfully.");

      setTimeout(() => {
        navigate("/owner/leave-requests");
      }, 1000);
    } catch (err) {
      setError(
        typeof err.message === "string"
          ? err.message
          : "Failed to update leave request.",
      );
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-text">Loading leave request...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Update Leave Request</h1>
        <p>Review the leave request and update its status.</p>
      </div>

      {message && <div className="message-success">{message}</div>}
      {error && <div className="message-error">{error}</div>}

      {!error && (
        <form onSubmit={handleSubmit} className="form-card">
          <div className="form-section">
            <h3>Leave Details</h3>

            <div className="form-grid">
              <div className="form-group full-width">
                <label>Student</label>

                <input
                  type="text"
                  value={
                    selectedStudent
                      ? `${selectedStudent.registration_no} - ${selectedStudent.full_name}`
                      : "Unknown Student"
                  }
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Leave Type</label>

                <input type="text" value={formData.leave_type} readOnly />
              </div>

              <div className="form-group">
                <label>Status</label>

                <select
                  name="request_status"
                  value={formData.request_status}
                  onChange={(e) =>
                    setFormData((current) => ({
                      ...current,
                      request_status: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="form-group">
                <label>Start Date</label>

                <input type="date" value={formData.start_date} readOnly />
              </div>

              <div className="form-group">
                <label>End Date</label>

                <input type="date" value={formData.end_date} readOnly />
              </div>

              <div className="form-group full-width">
                <label>Reason</label>

                <textarea value={formData.reason} readOnly />
              </div>
            </div>
          </div>

          <div>
            <button type="submit" className="btn btn-primary">
              Update Leave Request
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/owner/leave-requests")}
              style={{ marginLeft: "10px" }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default UpdateLeaveRequest;
