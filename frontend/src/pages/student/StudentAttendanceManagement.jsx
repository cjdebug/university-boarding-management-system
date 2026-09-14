import { useNavigate } from "react-router-dom";

function StudentAttendanceManagement() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Attendance</h1>
        <p>View your attendance records and manage your leave requests.</p>
      </div>

      <div className="action-grid">
        <div
          className="action-card"
          onClick={() => navigate("/student/attendance")}
        >
          <h3>My Attendance</h3>
          <p>View your attendance history and recorded status.</p>
        </div>

        <div
          className="action-card"
          onClick={() => navigate("/student/leave-request")}
        >
          <h3>Submit Leave Request</h3>
          <p>Submit a new leave request for an upcoming absence.</p>
        </div>

        <div
          className="action-card"
          onClick={() => navigate("/student/leave-requests")}
        >
          <h3>My Leave Requests</h3>
          <p>Review the leave requests you have submitted.</p>
        </div>
      </div>
    </div>
  );
}

export default StudentAttendanceManagement;
