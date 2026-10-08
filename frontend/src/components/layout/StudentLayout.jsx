import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import StudentSidebar from "./StudentSidebar";
import TopNavbar from "./TopNavbar";
import { getCurrentUser } from "../../services/api";

function StudentLayout() {
  const [student, setStudent] = useState({
    fullName: "",
    registrationNo: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudent = async () => {
      try {
        const data = await getCurrentUser();

        setStudent({
          fullName: data.full_name,
          registrationNo: data.registration_no,
        });
      } catch (error) {
        console.error("Failed to load student information:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
  }, []);

  return (
    <div className="app-layout">
      <StudentSidebar
        studentName={student.fullName}
        studentId={student.registrationNo}
      />

      <div className="main-area">
        <TopNavbar
          userType="student"
          userName={loading ? "Student" : student.fullName}
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
