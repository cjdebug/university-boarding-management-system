import { NavLink, useNavigate } from "react-router-dom";

import {
  House,
  UserRound,
  BedDouble,
  CalendarCheck,
  CreditCard,
  Megaphone,
  MessageSquare,
  Wrench,
  LogOut,
} from "lucide-react";

function StudentSidebar() {
  const navigate = useNavigate();

  const menuItems = [
    {
      label: "Dashboard",
      path: "/student/dashboard",
      icon: House,
    },
    {
      label: "My Profile",
      path: "/student/profile",
      icon: UserRound,
    },
    {
      label: "My Room & Allocation",
      path: "/student/room-allocation",
      icon: BedDouble,
    },
    {
      label: "Attendance",
      path: "/student/attendance-management",
      icon: CalendarCheck,
    },
    {
      label: "Boarding Fee & Payments",
      path: "/student/fee-payments",
      icon: CreditCard,
    },
    {
      label: "Announcements & Messages",
      path: "/student/announcements",
      icon: Megaphone,
    },
    {
      label: "Student Feedback",
      path: "/student/feedback-management",
      icon: MessageSquare,
    },
    {
      label: "My Requests",
      path: "/student/operations",
      icon: Wrench,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_role");

    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <House size={29} strokeWidth={1.8} />
        </div>

        <div className="sidebar-brand-text">
          <h2>Boarding System</h2>
          <p>Student Portal</p>
        </div>
      </div>

      <div className="sidebar-section-label">STUDENT PORTAL</div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={20} strokeWidth={1.8} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <button
          className="sidebar-link sidebar-logout"
          type="button"
          onClick={handleLogout}
        >
          <LogOut size={20} strokeWidth={1.8} />
          <span>Logout</span>
        </button>

        <div className="sidebar-profile">
          <div className="sidebar-profile-avatar">
            <UserRound size={21} />
          </div>

          <div className="sidebar-profile-text">
            <strong>Student Resident</strong>
            <span>Boarding Student</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default StudentSidebar;
