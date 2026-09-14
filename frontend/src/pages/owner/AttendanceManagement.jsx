import { useNavigate } from "react-router-dom";

function AttendanceManagement() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Attendance Management</h1>
        <p>Manage student attendance records and leave requests.</p>
      </div>

      <div className="action-grid">
        <div
          className="action-card"
          onClick={() => navigate("/owner/attendance/add")}
        >
          <h3>Mark Attendance</h3>
          <p>Record the daily attendance status of a student.</p>
        </div>

        <div
          className="action-card"
          onClick={() => navigate("/owner/attendance")}
        >
          <h3>View Attendance Records</h3>
          <p>Review previously recorded student attendance.</p>
        </div>

        <div
          className="action-card"
          onClick={() => navigate("/owner/leave-requests")}
        >
          <h3>View Leave Requests</h3>
          <p>Review leave requests submitted by student residents.</p>
        </div>
      </div>
    </div>
  );
}

export default AttendanceManagement;
