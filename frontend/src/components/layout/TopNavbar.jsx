import { Bell, Search, UserRound } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import { getUnreadNotificationCount } from "../../services/api";

function TopNavbar({ userType, userName, userId }) {
  const location = useLocation();

  const isOwner = userType === "owner";

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const data = await getUnreadNotificationCount();

        setUnreadCount(data.unread_count);
      } catch (error) {
        console.error("Failed to load notification count:", error);

        setUnreadCount(0);
      }
    };

    loadUnreadCount();
  }, [location.pathname]);

  const getPageTitle = () => {
    const path = location.pathname;

    // STUDENT PAGES

    if (userType === "student") {
      switch (path) {
        case "/student/dashboard":
          return `Welcome back, ${userName}!`;

        case "/student/profile":
          return "My Profile";

        case "/student/room-allocation":
          return "My Room & Allocation";

        case "/student/attendance-management":
          return "Attendance";

        case "/student/fee-payments":
          return "Boarding Fee & Payments";

        case "/student/announcements":
          return "Announcements & Messages";

        case "/student/feedback-management":
          return "Student Feedback";

        case "/student/operations":
          return "My Requests";

        default:
          return "Student Portal";
      }
    }

    // OWNER PAGES

    if (userType === "owner") {
      switch (path) {
        case "/owner/dashboard":
          return "Dashboard";

        case "/owner/student-room-management":
          return "Student & Room Allocation";

        case "/owner/fee-payments":
          return "Boarding Fee & Payments";

        case "/owner/attendance-management":
          return "Attendance Management";

        case "/owner/operations":
          return "Boarding Operations";

        case "/owner/communication-turnover":
          return "Communication & Turnover";

        case "/owner/reports":
          return "Reports";

        default:
          return "Management Portal";
      }
    }

    return "Dashboard";
  };

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <h1>{getPageTitle()}</h1>

        {isOwner ? (
          <p>Here's the overview of your boarding operations.</p>
        ) : (
          <p>Here's your boarding information and recent updates.</p>
        )}
      </div>

      <div className="navbar-right">
        {isOwner && (
          <div className="navbar-search">
            <Search size={19} />

            <input type="text" placeholder="Search students, rooms,..." />
          </div>
        )}

        <button
          className="notification-button"
          type="button"
          aria-label="Notifications"
        >
          <Bell size={25} strokeWidth={1.8} />

          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </button>

        <div className="navbar-profile">
          <div className="navbar-profile-avatar">
            <UserRound size={23} />
          </div>

          <div className="navbar-profile-info">
            {isOwner ? (
              <>
                <strong>Boarding Owner</strong>

                <span>Administrator</span>
              </>
            ) : (
              <>
                <strong>{userName}</strong>

                <span>{userId}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopNavbar;
