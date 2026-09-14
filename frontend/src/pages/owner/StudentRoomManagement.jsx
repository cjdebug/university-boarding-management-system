import { useNavigate } from "react-router-dom";

function StudentRoomManagement() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Student & Room Allocation</h1>
        <p>Manage student residents, rooms, and room allocations.</p>
      </div>

      <div className="action-grid">
        <div
          className="action-card"
          onClick={() => navigate("/owner/students/add")}
        >
          <h3>Add Student</h3>
          <p>Create a new student account and resident profile.</p>
        </div>

        <div
          className="action-card"
          onClick={() => navigate("/owner/room-allocations/add")}
        >
          <h3>Allocate Room</h3>
          <p>Assign an available room and bed to a student.</p>
        </div>

        <div
          className="action-card"
          onClick={() => navigate("/owner/rooms/add")}
        >
          <h3>Add Room</h3>
          <p>Add a new boarding room and capacity details.</p>
        </div>

        <div
          className="action-card"
          onClick={() => navigate("/owner/room-allocations")}
        >
          <h3>View Room Allocations</h3>
          <p>Review current student room and bed assignments.</p>
        </div>
      </div>
    </div>
  );
}

export default StudentRoomManagement;
