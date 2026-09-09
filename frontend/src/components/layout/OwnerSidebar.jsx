import { NavLink } from "react-router-dom";
import {
  House,
  Users,
  CreditCard,
  CalendarCheck,
  Wrench,
  MessageSquare,
  BarChart3,
  LogOut,
  UserRound,
} from "lucide-react";

function OwnerSidebar() {
  const menuItems = [
    {
      label: "Dashboard",
      path: "/owner/dashboard",
      icon: House,
    },
    {
      label: "Student & Room Allocation",
      path: "/owner/student-room-management",
      icon: Users,
    },
    {
      label: "Boarding Fee & Payments",
      path: "/owner/fee-records/add",
      icon: CreditCard,
    },
    {
      label: "Attendance Management",
      path: "/owner/attendance/add",
      icon: CalendarCheck,
    },
    {
      label: "Boarding Operations",
      path: "/owner/operations",
      icon: Wrench,
    },
    {
      label: "Communication & Turnover",
      path: "/owner/communication",
      icon: MessageSquare,
    },
    {
      label: "Reports",
      path: "/owner/reports",
      icon: BarChart3,
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <House size={30} strokeWidth={1.8} />
        </div>

        <div>
          <h2>Boarding System</h2>
          <p>Management Portal</p>
        </div>
      </div>

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

        <button className="sidebar-link sidebar-logout" type="button">
          <LogOut size={20} strokeWidth={1.8} />
          <span>Logout</span>
        </button>
      </nav>

      <div className="sidebar-profile">
        <div className="sidebar-profile-avatar">
          <UserRound size={22} />
        </div>

        <div className="sidebar-profile-text">
          <strong>Boarding Owner</strong>
          <span>Administrator</span>
        </div>
      </div>
    </aside>
  );
}

export default OwnerSidebar;
