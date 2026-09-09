import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";

import OwnerLayout from "../components/layout/OwnerLayout";
import StudentLayout from "../components/layout/StudentLayout";
import AllocateRoom from "../pages/owner/AllocateRoom";
import StudentRoomManagement from "../pages/owner/StudentRoomManagement";
import OwnerDashboard from "../pages/owner/Dashboard";
import StudentDashboard from "../pages/student/Dashboard";
import AddRoom from "../pages/owner/AddRoom";
import CreateFeeRecord from "../pages/owner/CreateFeeRecord";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />

      <Route path="/owner" element={<OwnerLayout />}>
        <Route path="dashboard" element={<OwnerDashboard />} />

        <Route path="rooms/add" element={<AddRoom />} />

        <Route
          path="student-room-management"
          element={<StudentRoomManagement />}
        />

        <Route path="fee-records/add" element={<CreateFeeRecord />} />

        <Route path="room-allocations/add" element={<AllocateRoom />} />
      </Route>

      <Route path="/student" element={<StudentLayout />}>
        <Route path="dashboard" element={<StudentDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;
