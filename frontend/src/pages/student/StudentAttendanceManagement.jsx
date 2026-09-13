import { useNavigate } from "react-router-dom";

function StudentAttendanceManagement() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Attendance</h1>

      <p>View your attendance and manage leave requests.</p>

      <div>
        <button onClick={() => navigate("/student/attendance")}>
          My Attendance
        </button>

        <button onClick={() => navigate("/student/leave-request")}>
          Submit Leave Request
        </button>

        <button onClick={() => navigate("/student/leave-requests")}>
          My Leave Requests
        </button>
      </div>
    </div>
  );
}

export default StudentAttendanceManagement;
