import { Outlet } from "react-router-dom";
import StudentSidebar from "./StudentSidebar";
import TopNavbar from "./TopNavbar";

function StudentLayout() {
  const student = {
    fullName: "Student User",
    registrationNo: "STU-0000",
  };

  return (
    <div className="app-layout">
      <StudentSidebar
        studentName={student.fullName}
        studentId={student.registrationNo}
      />

      <div className="main-area">
        <TopNavbar
          userType="student"
          userName={student.fullName}
          userId={student.registrationNo}
        />

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default StudentLayout;
