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
import ViewFeeRecords from "../pages/owner/ViewFeeRecords";
import MyFees from "../pages/student/MyFees";
import FeePaymentManagement from "../pages/owner/FeePaymentManagement";
import RecordPayment from "../pages/owner/RecordPayment";
import ViewPaymentHistory from "../pages/owner/ViewPaymentHistory";
import MyPaymentHistory from "../pages/student/MyPaymentHistory";
import StudentFeePaymentManagement from "../pages/student/StudentFeePaymentManagement";
import ViewAttendanceRecords from "../pages/owner/ViewAttendanceRecords";
import AttendanceManagement from "../pages/owner/AttendanceManagement";
import MyAttendance from "../pages/student/MyAttendance";
import SubmitLeaveRequest from "../pages/student/SubmitLeaveRequest";
import MyLeaveRequests from "../pages/student/MyLeaveRequests";
import StudentAttendanceManagement from "../pages/student/StudentAttendanceManagement";
import ViewLeaveRequests from "../pages/owner/ViewLeaveRequests";
import SubmitMaintenanceRequest from "../pages/student/SubmitMaintenanceRequest";
import MyMaintenanceRequests from "../pages/student/MyMaintenanceRequests";
import StudentOperationsManagement from "../pages/student/StudentOperationsManagement";
import ViewMaintenanceRequests from "../pages/owner/ViewMaintenanceRequests";
import OperationsManagement from "../pages/owner/OperationsManagement";
import SubmitComplaint from "../pages/student/SubmitComplaint";
import MyComplaints from "../pages/student/MyComplaints";
import ViewComplaints from "../pages/owner/ViewComplaints";
import OwnerViewAnnouncements from "../pages/owner/ViewAnnouncements";
import StudentViewAnnouncements from "../pages/student/ViewAnnouncements";
import SubmitFeedback from "../pages/student/SubmitFeedback";
import MyFeedback from "../pages/student/MyFeedback";
import ViewFeedback from "../pages/owner/ViewFeedback";
import StudentFeedbackManagement from "../pages/student/StudentFeedbackManagement";
import CommunicationTurnoverManagement from "../pages/owner/CommunicationTurnoverManagement";

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

        <Route path="fee-records" element={<ViewFeeRecords />} />

        <Route path="fee-payments" element={<FeePaymentManagement />} />

        <Route path="payments/add" element={<RecordPayment />} />

        <Route path="payments" element={<ViewPaymentHistory />} />

        <Route path="attendance" element={<ViewAttendanceRecords />} />

        <Route
          path="attendance-management"
          element={<AttendanceManagement />}
        />

        <Route path="leave-requests" element={<ViewLeaveRequests />} />

        <Route
          path="maintenance-requests"
          element={<ViewMaintenanceRequests />}
        />

        <Route path="operations" element={<OperationsManagement />} />

        <Route path="complaints" element={<ViewComplaints />} />

        <Route path="announcements" element={<OwnerViewAnnouncements />} />

        <Route path="feedback" element={<ViewFeedback />} />

        <Route
          path="communication-turnover"
          element={<CommunicationTurnoverManagement />}
        />
      </Route>

      <Route path="/student" element={<StudentLayout />}>
        <Route path="dashboard" element={<StudentDashboard />} />

        <Route path="room-allocation" element={<MyRoomAllocation />} />

        <Route path="fees" element={<MyFees />} />

        <Route path="payment-history" element={<MyPaymentHistory />} />

        <Route path="fee-payments" element={<StudentFeePaymentManagement />} />

        <Route path="attendance" element={<MyAttendance />} />

        <Route path="leave-request" element={<SubmitLeaveRequest />} />

        <Route path="leave-requests" element={<MyLeaveRequests />} />

        <Route
          path="attendance-management"
          element={<StudentAttendanceManagement />}
        />

        <Route
          path="maintenance-request"
          element={<SubmitMaintenanceRequest />}
        />

        <Route
          path="maintenance-requests"
          element={<MyMaintenanceRequests />}
        />

        <Route path="operations" element={<StudentOperationsManagement />} />

        <Route path="complaint" element={<SubmitComplaint />} />

        <Route path="complaints" element={<MyComplaints />} />

        <Route path="announcements" element={<StudentViewAnnouncements />} />

        <Route path="feedback/add" element={<SubmitFeedback />} />

        <Route path="feedback" element={<MyFeedback />} />

        <Route
          path="feedback-management"
          element={<StudentFeedbackManagement />}
        />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;
