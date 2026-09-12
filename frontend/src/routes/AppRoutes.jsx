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
import MarkAttendance from "../pages/owner/MarkAttendance";
import CreateMaintenanceRequest from "../pages/owner/CreateMaintenanceRequest";
import CreateAnnouncement from "../pages/owner/CreateAnnouncement";
import ViewRoomAllocations from "../pages/owner/ViewRoomAllocations";
import MyRoomAllocation from "../pages/student/MyRoomAllocation";
import AddStudent from "../pages/owner/AddStudent";

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

        <Route path="attendance/add" element={<MarkAttendance />} />

        <Route path="room-allocations/add" element={<AllocateRoom />} />

        <Route
          path="maintenance-requests/add"
          element={<CreateMaintenanceRequest />}
        />

        <Route path="announcements/add" element={<CreateAnnouncement />} />

        <Route path="room-allocations" element={<ViewRoomAllocations />} />

        <Route path="students/add" element={<AddStudent />} />
      </Route>

      <Route path="/student" element={<StudentLayout />}>
        <Route path="dashboard" element={<StudentDashboard />} />

        <Route path="room-allocation" element={<MyRoomAllocation />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;
