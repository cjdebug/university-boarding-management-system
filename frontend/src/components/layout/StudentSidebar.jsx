import { NavLink } from "react-router-dom";
import {
  House,
  UserRound,
  BedDouble,
  CalendarCheck,
  CreditCard,
  Megaphone,
  Star,
  ClipboardList,
  LogOut,
} from "lucide-react";

function StudentSidebar({ studentName, studentId }) {
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
      path: "/student/room",
      icon: BedDouble,
    },
    {
      label: "Attendance",
      path: "/student/attendance",
      icon: CalendarCheck,
    },
    {
      label: "Boarding Fee & Payments",
      path: "/student/payments",
      icon: CreditCard,
    },
    {
      label: "Announcements & Messages",
      path: "/student/announcements",
      icon: Megaphone,
    },
    {
      label: "Student Feedback",
      path: "/student/feedback",
      icon: Star,
    },
    {
      label: "My Requests",
      path: "/student/requests",
      icon: ClipboardList,
    },
  ];

  return (
    <aside className="sidebar">
      {/* Brand / System Name */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <House size={30} strokeWidth={1.8} />
        </div>

        <div>
          <h2>Boarding System</h2>
          <p>Student Portal</p>
        </div>
      </div>

      {/* Navigation Menu */}
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

        {/* Logout */}
        <button className="sidebar-link sidebar-logout" type="button">
          <LogOut size={20} strokeWidth={1.8} />
          <span>Logout</span>
        </button>
      </nav>

      {/* Logged-in Student Information */}
      <div className="sidebar-profile">
        <div className="sidebar-profile-avatar">
          <UserRound size={22} />
        </div>

        <div className="sidebar-profile-text">
          <strong>{studentName}</strong>
          <span>{studentId}</span>
        </div>
      </div>
    </aside>
  );
}

export default StudentSidebar;
