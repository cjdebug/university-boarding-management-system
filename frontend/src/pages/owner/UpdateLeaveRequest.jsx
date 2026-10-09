import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../../services/api";

const today = new Date().toISOString().split("T")[0];

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
          (request) => request.leave_request_id === Number(leave_request_id),
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const dataToSend = {
        leave_type: formData.leave_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason,
        request_status: formData.request_status,
      };

      const updatedRequest = await apiRequest(
        `/leave-requests/${leave_request_id}`,
        {
          method: "PUT",
          body: JSON.stringify(dataToSend),
        },
      );

      setMessage(
        `Leave request updated successfully. Request ID: ${updatedRequest.leave_request_id}`,
      );

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
        <p>Update a student leave request and its status.</p>
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

                <select
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Student</option>

                  {students.map((student) => (
                    <option key={student.student_id} value={student.student_id}>
                      {student.registration_no} - {student.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Leave Type</label>

                <select
                  name="leave_type"
                  value={formData.leave_type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Leave Type</option>
                  <option value="Home Visit">Home Visit</option>
                  <option value="Overnight Leave">Overnight Leave</option>
                  <option value="Personal">Personal</option>
                  <option value="Medical">Medical</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>

                <select
                  name="request_status"
                  value={formData.request_status}
                  onChange={handleChange}
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="form-group">
                <label>Start Date</label>

                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  min={today}
                  required
                />
              </div>

              <div className="form-group">
                <label>End Date</label>

                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  min={formData.start_date || today}
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Reason</label>

                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                />
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
