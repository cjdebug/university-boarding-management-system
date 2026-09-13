import { useNavigate } from "react-router-dom";

function AttendanceManagement() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Attendance Management</h1>

      <p>Manage student attendance records.</p>

      <div>
        <button onClick={() => navigate("/owner/attendance/add")}>
          Mark Attendance
        </button>

        <button onClick={() => navigate("/owner/attendance")}>
          View Attendance Records
        </button>

        <button onClick={() => navigate("/owner/leave-requests")}>
          View Leave Requests
        </button>
      </div>
    </div>
  );
}

export default AttendanceManagement;
