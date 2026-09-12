import { useNavigate } from "react-router-dom";

function StudentRoomManagement() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Student & Room Allocation Management</h1>

      <p>Manage boarding rooms and allocate students to available rooms.</p>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <button onClick={() => navigate("/owner/room-allocations/add")}>
          Allocate Room to Student
        </button>

        <button onClick={() => navigate("/owner/rooms/add")}>
          Add New Room
        </button>

        <button onClick={() => navigate("/owner/room-allocations")}>
          View Room Allocations
        </button>

        <button onClick={() => navigate("/owner/students/add")}>
          Add Student
        </button>
      </div>
    </div>
  );
}

export default StudentRoomManagement;
